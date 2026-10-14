import { Request, Response } from "express";
import crypto from "crypto";
import path from "path";
import { prisma } from "../prisma";
import VerifiedRankingService from "../services/verifiedRanking.service";
import ScorecardOcrService from "../services/scorecardOcr.service";
import mailService from "../services/mail.service";
import { AuthenticatedInstitutionRequest } from "../middleware/institutionAuth.middleware";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const MatchController = {
  /**
   * Submit Match with Participants, Scores & Evidences (Institution)
   */
  async createMatch(req: AuthenticatedInstitutionRequest, res: Response) {
    try {
      if (!req.institution) {
        return res.status(401).json({ success: false, message: "Unauthorized. Institution login required." });
      }

      const instituteId = req.institution.id;
      const {
        sport,
        competitionName,
        eventId,
        category,
        refereeDetails,
        disqualificationInfo,
        opponentName,
        venue,
        matchDate,
        matchFormat,
        rulesSummary,
        finalScore,
        winner,
        resultSummary,
        participants = [],
        evidences = [],
        isDraft = false,
      } = req.body;

      if (!sport || !competitionName || !venue || !matchDate || !matchFormat || !finalScore) {
        return res.status(400).json({
          success: false,
          message: "Please fill in all required match details (Sport, Competition Name, Venue, Date, Format, Final Score).",
        });
      }

      // Check event management authorization if eventId provided
      if (eventId) {
        const managedEvent = await prisma.event.findFirst({
          where: { id: eventId, institutionId: instituteId },
        });
        if (!managedEvent) {
          return res.status(403).json({
            success: false,
            message: "Institutions are only authorized to submit match results for events they manage.",
          });
        }
      }

      const parsedDate = new Date(matchDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid match date format." });
      }

      // Anti-Cheating Control: Duplicate Submission Check
      // Check for same sport, same date, same competition submitted by this institute
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingDuplicate = await prisma.match.findFirst({
        where: {
          instituteId,
          sport: sport.trim(),
          competitionName: competitionName.trim(),
          matchDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (existingDuplicate) {
        return res.status(409).json({
          success: false,
          message: `A match for '${competitionName}' in ${sport} on this date was already submitted (Match #${existingDuplicate.matchNumber}). Duplicate submissions are blocked.`,
        });
      }

      // Generate unique match number: SR-M-YYYY-RANDOM5
      const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
      const year = new Date().getFullYear();
      const matchNumber = `SR-M-${year}-${randomHex}`;

      const matchStatus = isDraft ? "DRAFT" : "SUBMITTED";

      // Create Match in a database transaction
      const createdMatch = await prisma.$transaction(async (tx) => {
        const match = await tx.match.create({
          data: {
            matchNumber,
            sport: sport.trim(),
            competitionName: competitionName.trim(),
            eventId: eventId || null,
            instituteId,
            category: category?.trim() || null,
            refereeDetails: typeof refereeDetails === "object" ? JSON.stringify(refereeDetails) : refereeDetails?.trim() || null,
            disqualificationInfo: disqualificationInfo?.trim() || null,
            opponentName: opponentName?.trim() || null,
            venue: venue.trim(),
            matchDate: parsedDate,
            matchFormat: matchFormat.trim(),
            rulesSummary: rulesSummary?.trim() || null,
            finalScore: finalScore.trim(),
            winner: winner?.trim() || null,
            resultSummary: resultSummary?.trim() || null,
            status: matchStatus,
          },
        });

        // Insert Participants
        if (Array.isArray(participants) && participants.length > 0) {
          for (const p of participants) {
            // Find user by id or athleteId
            let athleteUser = null;
            if (p.athleteId) {
              athleteUser = await tx.user.findFirst({
                where: {
                  OR: [{ id: p.athleteId }, { athleteId: p.athleteId }],
                },
              });
            }

            if (athleteUser) {
              const outcome = p.outcome || (winner && p.teamName && winner.toLowerCase().includes(p.teamName.toLowerCase()) ? "WON" : "LOST");
              const statsObj = typeof p.individualStats === "object" ? p.individualStats : JSON.parse(p.individualStats || "{}");
              const calculatedRating = VerifiedRankingService.calculateMatchPlayerRating(sport, statsObj, outcome);

              await tx.matchParticipant.create({
                data: {
                  matchId: match.id,
                  athleteId: athleteUser.id,
                  teamName: p.teamName?.trim() || null,
                  role: p.role?.trim() || null,
                  position: p.position ? parseInt(p.position, 10) : null,
                  placement: p.placement?.trim() || null,
                  disqualified: Boolean(p.disqualified),
                  individualStats: JSON.stringify(statsObj),
                  performanceRating: calculatedRating,
                  verifiedStatsSaved: false,
                },
              });
            }
          }
        }

        // Insert Evidences with SHA256 and Scorecard AI OCR
        if (Array.isArray(evidences) && evidences.length > 0) {
          for (const ev of evidences) {
            if (ev.fileUrl) {
              const fileName = path.basename(ev.fileUrl);
              const fullFilePath = path.join(process.cwd(), "uploads", fileName);
              let sha256 = "";
              let isDuplicate = false;
              let ocrResult: any = null;

              try {
                sha256 = await ScorecardOcrService.computeFileSha256(fullFilePath);
                if (sha256) {
                  const dup = await ScorecardOcrService.checkDuplicateEvidence(sha256, match.id);
                  if (dup) isDuplicate = true;
                }

                if (ev.category === "scorecard") {
                  ocrResult = await ScorecardOcrService.processScorecard(ev.fileUrl, ev.fileType || "image/jpeg", {
                    sport,
                    competitionName,
                    finalScore,
                    winner,
                    matchDate: parsedDate.toISOString(),
                    venue,
                  });
                }
              } catch (e: any) {
                console.warn("Evidence processing warning:", e.message);
              }

              await tx.matchEvidence.create({
                data: {
                  matchId: match.id,
                  fileUrl: ev.fileUrl,
                  fileName: ev.fileName || fileName,
                  fileType: ev.fileType || "application/octet-stream",
                  fileSize: Number(ev.fileSize) || 0,
                  category: ev.category || "scorecard",
                  sha256Hash: sha256 || null,
                  ocrData: ocrResult ? JSON.stringify(ocrResult) : null,
                  ocrStatus: ocrResult?.status || (isDuplicate ? "DUPLICATE_FLAGGED" : "PENDING"),
                  ocrConfidence: ocrResult ? ocrResult.confidenceScore : null,
                  uploaderId: instituteId,
                  uploaderType: "INSTITUTION",
                  verificationFlag: isDuplicate ? "SUSPICIOUS" : "PENDING",
                  notes: ev.notes?.trim() || (isDuplicate ? "Duplicate evidence hash flagged" : null),
                },
              });
            }
          }
        }

        // Record Audit Log
        await tx.auditLog.create({
          data: {
            entityType: "MATCH",
            entityId: match.id,
            action: isDraft ? "SAVED_DRAFT" : "SUBMITTED",
            actorId: instituteId,
            actorRole: "INSTITUTION",
            details: JSON.stringify({
              matchNumber,
              competitionName,
              sport,
              participantsCount: participants.length,
              evidencesCount: evidences.length,
            }),
          },
        });

        return match;
      });

      return res.status(201).json({
        success: true,
        message: isDraft
          ? "Match saved as draft successfully."
          : "Match submitted for official verification! Evidence is now in review queue.",
        match: createdMatch,
      });
    } catch (err: any) {
      console.error("Create Match Error:", err);
      return res.status(500).json({ success: false, message: err.message || "Failed to submit match." });
    }
  },

  /**
   * List Matches (Public / Filterable)
   */
  async getMatches(req: Request, res: Response) {
    try {
      const { sport, status, instituteId, page = "1", limit = "15" } = req.query;

      const whereClause: any = {};
      if (sport && typeof sport === "string" && sport !== "All") {
        whereClause.sport = sport;
      }
      if (status && typeof status === "string" && status !== "All") {
        whereClause.status = status;
      }
      if (instituteId && typeof instituteId === "string") {
        whereClause.instituteId = instituteId;
      }

      const p = Math.max(1, parseInt(page as string, 10));
      const lim = Math.max(1, Math.min(50, parseInt(limit as string, 10)));
      const skip = (p - 1) * lim;

      const [matches, totalCount] = await Promise.all([
        prisma.match.findMany({
          where: whereClause,
          orderBy: { matchDate: "desc" },
          skip,
          take: lim,
          include: {
            institution: {
              select: { id: true, name: true, city: true, state: true, logo: true },
            },
            _count: {
              select: {
                participants: true,
                evidences: true,
                disputes: true,
              },
            },
          },
        }),
        prisma.match.count({ where: whereClause }),
      ]);

      return res.status(200).json({
        success: true,
        matches,
        pagination: {
          total: totalCount,
          page: p,
          limit: lim,
          totalPages: Math.ceil(totalCount / lim),
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to fetch matches." });
    }
  },

  /**
   * Get Single Match Details with Scorecard, Evidences, Participants & Audit Logs
   */
  async getMatchById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const match = await prisma.match.findFirst({
        where: {
          OR: [{ id }, { matchNumber: id }],
        },
        include: {
          institution: {
            select: { id: true, name: true, city: true, state: true, logo: true, contactNumber: true, email: true },
          },
          participants: {
            include: {
              athlete: {
                select: {
                  id: true,
                  athleteId: true,
                  fullName: true,
                  sport: true,
                  ageCategory: true,
                  gender: true,
                  avatarUrl: true,
                  isVerified: true,
                  verifiedPerformanceScore: true,
                  isProvisional: true,
                },
              },
            },
          },
          evidences: true,
          disputes: {
            include: {
              raisedByUser: {
                select: { fullName: true, athleteId: true },
              },
            },
          },
        },
      });

      if (!match) {
        return res.status(404).json({ success: false, message: "Match not found." });
      }

      // Fetch audit logs for this match
      const auditLogs = await prisma.auditLog.findMany({
        where: { entityType: "MATCH", entityId: match.id },
        orderBy: { timestamp: "desc" },
      });

      // Format individual stats cleanly
      const formattedParticipants = match.participants.map((p) => ({
        id: p.id,
        athlete: p.athlete,
        teamName: p.teamName,
        role: p.role,
        individualStats: JSON.parse(p.individualStats || "{}"),
        performanceRating: p.performanceRating,
        verifiedStatsSaved: p.verifiedStatsSaved,
      }));

      return res.status(200).json({
        success: true,
        match: {
          ...match,
          participants: formattedParticipants,
          auditLogs,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Failed to fetch match details." });
    }
  },

  /**
   * Review Match (Admin / Authorized Reviewer)
   * Approves (VERIFIED), Rejects (REJECTED), or Requests Changes (CHANGES_REQUESTED)
   */
  async reviewMatch(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, decisionNotes, reviewerName = "Chief Review Official" } = req.body;

      if (!["VERIFIED", "REJECTED", "CHANGES_REQUESTED", "UNDER_REVIEW"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid review status. Allowed: VERIFIED, REJECTED, CHANGES_REQUESTED, UNDER_REVIEW.",
        });
      }

      const match = await prisma.match.findUnique({
        where: { id },
        include: {
          institution: true,
          participants: true,
        },
      });

      if (!match) {
        return res.status(404).json({ success: false, message: "Match not found." });
      }

      const updateData: any = {
        status,
        reviewedBy: reviewerName,
        reviewedAt: new Date(),
      };

      if (status === "REJECTED") {
        updateData.rejectionReason = decisionNotes || "Evidence does not satisfy national verification criteria.";
      } else if (status === "CHANGES_REQUESTED") {
        updateData.changeRequestNotes = decisionNotes || "Please provide official signed scorecard image.";
      } else if (status === "VERIFIED") {
        updateData.isCompleted = true;
      }

      // Update match
      const updatedMatch = await prisma.match.update({
        where: { id },
        data: updateData,
      });

      // Record Audit Log
      await prisma.auditLog.create({
        data: {
          entityType: "MATCH",
          entityId: match.id,
          action: status,
          actorId: reviewerName,
          actorRole: "ADMIN",
          details: JSON.stringify({
            status,
            decisionNotes,
            reviewedAt: updateData.reviewedAt,
          }),
        },
      });

      // If approved -> Trigger Automatic Match Completion, Stats Saving, and AI Recalculation
      if (status === "VERIFIED") {
        // Mark all participant stats as verified
        await prisma.matchParticipant.updateMany({
          where: { matchId: match.id },
          data: { verifiedStatsSaved: true },
        });

        // Recalculate official verified score and rankings for all participants
        for (const p of match.participants) {
          try {
            await VerifiedRankingService.recalculateAthleteVerifiedScore(p.athleteId, match.id);
            // Fire AI report generation asynchronously in background
            VerifiedRankingService.generateVerifiedAiReport(p.athleteId).catch((e) =>
              console.warn("Async AI report notice:", e.message)
            );
          } catch (rankErr: any) {
            console.error(`Error updating rank for athlete ${p.athleteId}:`, rankErr.message);
          }
        }

        // Recalculate sport-wide national & state ranks
        await VerifiedRankingService.recalculateSportRankings(match.sport);

        // Notify submitting institution
        if (match.institution?.email) {
          await mailService.sendMatchStatusEmail({
            to: match.institution.email,
            institutionName: match.institution.name,
            matchNumber: match.matchNumber,
            competitionName: match.competitionName,
            status: "VERIFIED",
            reviewerNotes: decisionNotes,
          });

          await prisma.notification.create({
            data: {
              institutionId: match.institution.id,
              title: `Match ${match.matchNumber} Verified!`,
              message: `Official match results for '${match.competitionName}' have been verified and added to national rankings.`,
              type: "success",
            },
          });
        }
      } else if (status === "REJECTED" || status === "CHANGES_REQUESTED") {
        if (match.institution?.email) {
          await mailService.sendMatchStatusEmail({
            to: match.institution.email,
            institutionName: match.institution.name,
            matchNumber: match.matchNumber,
            competitionName: match.competitionName,
            status: status as any,
            reviewerNotes: decisionNotes,
          });

          await prisma.notification.create({
            data: {
              institutionId: match.institution.id,
              title: `Match ${match.matchNumber} Review Update: ${status}`,
              message: decisionNotes || `Reviewer has updated status to ${status}.`,
              type: status === "CHANGES_REQUESTED" ? "warning" : "alert",
            },
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: `Match review decision saved: ${status}.`,
        match: updatedMatch,
      });
    } catch (err: any) {
      console.error("Review Match Error:", err);
      return res.status(500).json({ success: false, message: err.message || "Failed to submit review." });
    }
  },

  /**
   * Raise a Dispute on a Match (Athlete or Institution)
   */
  async raiseDispute(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason, evidenceUrl, athleteId, instituteId } = req.body;

      if (!reason || reason.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: "Please describe the reason for dispute in detail (min 10 characters).",
        });
      }

      const match = await prisma.match.findUnique({ where: { id } });
      if (!match) {
        return res.status(404).json({ success: false, message: "Match not found." });
      }

      const dispute = await prisma.dispute.create({
        data: {
          matchId: match.id,
          raisedByUserId: athleteId || null,
          raisedByInstituteId: instituteId || null,
          reason: reason.trim(),
          evidenceUrl: evidenceUrl || null,
          status: "OPEN",
        },
      });

      // Update match status to DISPUTED if it was submitted or verified
      await prisma.match.update({
        where: { id: match.id },
        data: { status: "DISPUTED" },
      });

      // Record Audit Log
      await prisma.auditLog.create({
        data: {
          entityType: "DISPUTE",
          entityId: dispute.id,
          action: "DISPUTED",
          actorId: athleteId || instituteId || "Anonymous",
          actorRole: athleteId ? "ATHLETE" : "INSTITUTION",
          details: JSON.stringify({ matchId: match.id, reason }),
        },
      });

      return res.status(201).json({
        success: true,
        message: "Dispute submitted successfully. An authorized administrator has been alerted.",
        dispute,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || "Failed to raise dispute." });
    }
  },

  /**
   * Run Real-Time AI Scorecard Analysis & Document Integrity Audit
   */
  async analyzeScorecard(req: AuthenticatedInstitutionRequest, res: Response) {
    try {
      const {
        fileUrl,
        mimeType = "image/jpeg",
        sport,
        competitionName,
        finalScore,
        winner,
        venue,
        matchDate,
      } = req.body;

      if (!fileUrl) {
        return res.status(400).json({ success: false, message: "Scorecard file URL is required." });
      }

      const result = await ScorecardOcrService.processScorecard(fileUrl, mimeType, {
        sport,
        competitionName,
        finalScore,
        winner,
        venue,
        matchDate,
      });

      return res.status(200).json({
        success: true,
        result,
      });
    } catch (err: any) {
      console.error("Analyze Scorecard Error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to analyze scorecard.",
      });
    }
  },
};

export default MatchController;
