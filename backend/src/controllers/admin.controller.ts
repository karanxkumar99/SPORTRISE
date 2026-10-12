import { Request, Response } from "express";
import { prisma } from "../prisma";

export const AdminController = {
  /**
   * Super-admin & Reviewer Platform Overview Stats
   */
  async getOverview(req: Request, res: Response) {
    try {
      const [
        totalInstitutions,
        verifiedInstitutions,
        totalEvents,
        publishedEvents,
        totalApplications,
        totalMatches,
        pendingMatchesCount,
        verifiedMatchesCount,
        openDisputesCount,
        institutionsList,
        eventsList,
        pendingMatchesList,
      ] = await Promise.all([
        prisma.institution.count(),
        prisma.institution.count({ where: { isVerified: true } }),
        prisma.event.count(),
        prisma.event.count({ where: { status: "Published" } }),
        prisma.application.count(),
        prisma.match.count(),
        prisma.match.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
        prisma.match.count({ where: { status: "VERIFIED" } }),
        prisma.dispute.count({ where: { status: "OPEN" } }),
        prisma.institution.findMany({
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            _count: { select: { events: true, matchesSubmitted: true } },
          },
        }),
        prisma.event.findMany({
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            institution: { select: { name: true, type: true, isVerified: true } },
            _count: { select: { applications: true } },
          },
        }),
        prisma.match.findMany({
          where: { status: { in: ["SUBMITTED", "UNDER_REVIEW", "CHANGES_REQUESTED"] } },
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            institution: { select: { name: true, city: true, state: true } },
            _count: { select: { participants: true, evidences: true, disputes: true } },
          },
        }),
      ]);

      return res.status(200).json({
        success: true,
        stats: {
          totalInstitutions,
          verifiedInstitutions,
          totalEvents,
          publishedEvents,
          totalApplications,
          totalMatches,
          pendingMatches: pendingMatchesCount,
          verifiedMatches: verifiedMatchesCount,
          openDisputes: openDisputesCount,
        },
        institutions: institutionsList,
        events: eventsList,
        pendingMatches: pendingMatchesList,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Failed to fetch admin overview." });
    }
  },

  /**
   * Toggle Institution Verification
   */
  async toggleInstitutionVerification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isVerified } = req.body;

      const updated = await prisma.institution.update({
        where: { id },
        data: {
          isVerified: Boolean(isVerified),
          emailVerifiedAt: Boolean(isVerified) ? new Date() : null,
        },
      });

      return res.status(200).json({
        success: true,
        message: `Institution verification set to ${Boolean(isVerified)}`,
        institution: updated,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Failed to toggle verification." });
    }
  },

  /**
   * Moderate Event Status (Publish, Draft, Unpublish, Cancel)
   */
  async moderateEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updated = await prisma.event.update({
        where: { id },
        data: { status },
      });

      return res.status(200).json({
        success: true,
        message: `Event status updated to ${status}`,
        event: updated,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Failed to moderate event." });
    }
  },
};

export default AdminController;
