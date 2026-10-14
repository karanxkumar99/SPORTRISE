import fs from "fs";
import path from "path";
import crypto from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../prisma";

export interface ScorecardAnalysisResult {
  status: "AI_SERVICE_NOT_CONFIGURED" | "EXTRACTED" | "HUMAN_REVIEW_REQUIRED" | "FAILED" | "DUPLICATE_FLAGGED";
  confidenceScore: number; // 0.0 - 1.0
  requiresHumanReview: boolean;
  message: string;
  sha256Hash: string;
  isDuplicateEvidence: boolean;
  duplicateMatchNumber?: string;
  extractedData?: {
    sport?: string;
    competitionName?: string;
    category?: string;
    matchDate?: string;
    venue?: string;
    teams?: string[];
    finalScore?: string;
    winner?: string;
    referee?: string;
    athletes?: Array<{
      name: string;
      athleteId?: string;
      matchedUserId?: string;
      score?: string | number;
      position?: number;
      stats?: Record<string, any>;
      matchConfidence?: number;
    }>;
  } | null;
  detectedInconsistencies: string[];
  proposedCorrections: string[];
}

export const ScorecardOcrService = {
  /**
   * Computes SHA-256 hash of a file on disk for anti-fraud
   */
  async computeFileSha256(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        if (!fs.existsSync(filePath)) {
          return resolve("");
        }
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(filePath);
        stream.on("data", (chunk) => hash.update(chunk));
        stream.on("end", () => resolve(hash.digest("hex")));
        stream.on("error", (err) => reject(err));
      } catch (e) {
        reject(e);
      }
    });
  },

  /**
   * Checks if an identical scorecard hash exists in previously verified or submitted matches
   */
  async checkDuplicateEvidence(sha256Hash: string, currentMatchId?: string) {
    if (!sha256Hash) return null;

    const duplicate = await prisma.matchEvidence.findFirst({
      where: {
        sha256Hash,
        ...(currentMatchId ? { matchId: { not: currentMatchId } } : {}),
      },
      include: {
        match: {
          select: { matchNumber: true, competitionName: true, matchDate: true, status: true },
        },
      },
    });

    return duplicate;
  },

  /**
   * AI-assisted scorecard reading, OCR parsing, identity matching, and discrepancy audit
   */
  async processScorecard(
    fileUrl: string,
    mimeType: string,
    submittedMatchData: {
      sport?: string;
      competitionName?: string;
      finalScore?: string;
      winner?: string;
      matchDate?: string;
      venue?: string;
      participants?: Array<{ athleteId?: string; teamName?: string }>;
    }
  ): Promise<ScorecardAnalysisResult> {
    // Resolve absolute path to file in uploads directory
    const fileName = path.basename(fileUrl);
    const absoluteFilePath = path.join(process.cwd(), "uploads", fileName);

    // 1. Compute SHA-256 hash
    let sha256 = "";
    try {
      sha256 = await this.computeFileSha256(absoluteFilePath);
    } catch (err: any) {
      console.warn("Could not compute file SHA-256:", err.message);
    }

    // 2. Anti-fraud check: Detect duplicate scorecard upload
    let isDuplicate = false;
    let duplicateMatchNumber = "";
    if (sha256) {
      const duplicateRecord = await this.checkDuplicateEvidence(sha256);
      if (duplicateRecord) {
        isDuplicate = true;
        duplicateMatchNumber = duplicateRecord.match.matchNumber;
      }
    }

    // 3. Check if Gemini AI is configured
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return {
        status: isDuplicate ? "DUPLICATE_FLAGGED" : "AI_SERVICE_NOT_CONFIGURED",
        confidenceScore: 0,
        requiresHumanReview: true,
        message: isDuplicate
          ? `WARNING: Duplicate Scorecard detected! This exact file was previously submitted in Match #${duplicateMatchNumber}. Gemini OCR is unconfigured; flagged for mandatory official review.`
          : "Google Gemini Document AI service is not configured (GEMINI_API_KEY is empty). Scorecard uploaded safely and queued for official manual human verification.",
        sha256Hash: sha256,
        isDuplicateEvidence: isDuplicate,
        duplicateMatchNumber: duplicateMatchNumber || undefined,
        extractedData: null,
        detectedInconsistencies: isDuplicate
          ? [`Scorecard file SHA-256 (${sha256.substring(0, 10)}...) matches Match #${duplicateMatchNumber}`]
          : [],
        proposedCorrections: [],
      };
    }

    // 4. Gemini AI Document Processing
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      if (!fs.existsSync(absoluteFilePath)) {
        return {
          status: "FAILED",
          confidenceScore: 0,
          requiresHumanReview: true,
          message: "Scorecard file could not be read from storage.",
          sha256Hash: sha256,
          isDuplicateEvidence: isDuplicate,
          extractedData: null,
          detectedInconsistencies: ["File missing on disk"],
          proposedCorrections: [],
        };
      }

      const fileBuffer = fs.readFileSync(absoluteFilePath);
      const base64Data = fileBuffer.toString("base64");

      const prompt = `You are an Olympic and Indian national sports document referee AI.
Analyze this official match scorecard, tournament result sheet, or competition log sheet.
Extract ALL structured details in valid JSON format only (do NOT enclose in markdown backticks, just raw JSON).

JSON structure:
{
  "sport": "Athletics / Badminton / Football / Cricket / etc",
  "competitionName": "Event title from document",
  "category": "U-14 / U-17 / U-19 / Senior",
  "matchDate": "YYYY-MM-DD or as stated",
  "venue": "Ground / Stadium name",
  "teams": ["Team A", "Team B"],
  "finalScore": "Extracted final score e.g. 21-18, 21-15 or 3-1",
  "winner": "Winning team or athlete name",
  "referee": "Chief official or referee name if visible",
  "confidenceScore": 0.95,
  "athletes": [
    {
      "name": "Full athlete name",
      "athleteId": "SR-A-YYYY-XXXX if printed, else empty",
      "score": "Points / runs / goals / timing / distance",
      "position": 1,
      "stats": {}
    }
  ]
}

Strict Rules:
- NEVER invent or hallucinate scores or winners. If illegible, set confidenceScore < 0.60.
- If it is not a sports scorecard or document, set confidenceScore to 0.10.`;

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: mimeType.startsWith("image/") ? mimeType : "application/pdf",
            data: base64Data,
          },
        },
        prompt,
      ]);

      const responseText = result.response.text();
      let parsedJson: any = null;
      try {
        const cleanJsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        parsedJson = JSON.parse(cleanJsonStr);
      } catch (parseErr) {
        console.warn("Could not parse Gemini JSON response:", responseText);
      }

      if (!parsedJson) {
        return {
          status: "HUMAN_REVIEW_REQUIRED",
          confidenceScore: 0.3,
          requiresHumanReview: true,
          message: "AI document scan completed with low confidence. Manual review required by officiating committee.",
          sha256Hash: sha256,
          isDuplicateEvidence: isDuplicate,
          duplicateMatchNumber: duplicateMatchNumber || undefined,
          extractedData: null,
          detectedInconsistencies: ["Unstructured or partially illegible scorecard format"],
          proposedCorrections: [],
        };
      }

      const confidence = Number(parsedJson.confidenceScore) || 0.75;
      const inconsistencies: string[] = [];
      const corrections: string[] = [];

      if (isDuplicate) {
        inconsistencies.push(
          `Fraud Warning: This scorecard file was previously verified under Match #${duplicateMatchNumber}`
        );
      }

      // Step 3: Match athletes to existing Athlete IDs in SportRise DB
      if (Array.isArray(parsedJson.athletes)) {
        for (const ath of parsedJson.athletes) {
          if (ath.name) {
            const foundUser = await prisma.user.findFirst({
              where: {
                OR: [
                  { fullName: { contains: ath.name } },
                  ...(ath.athleteId ? [{ athleteId: ath.athleteId }] : []),
                ],
              },
              select: { id: true, athleteId: true, fullName: true },
            });

            if (foundUser) {
              ath.matchedUserId = foundUser.id;
              ath.athleteId = foundUser.athleteId;
              ath.matchConfidence = 0.95;
            } else {
              ath.matchConfidence = 0.4;
              inconsistencies.push(
                `Athlete '${ath.name}' on scorecard could not be matched with high confidence to a SportRise Athlete ID.`
              );
              corrections.push(`Manually link '${ath.name}' to their verified SportRise profile.`);
            }
          }
        }
      }

      // Step 4: Validate against institution-submitted details
      if (submittedMatchData.finalScore && parsedJson.finalScore) {
        const normSub = submittedMatchData.finalScore.replace(/[\s-]/g, "").toLowerCase();
        const normExt = String(parsedJson.finalScore).replace(/[\s-]/g, "").toLowerCase();
        if (normSub !== normExt && !normSub.includes(normExt) && !normExt.includes(normSub)) {
          inconsistencies.push(
            `Score mismatch: Institution entered '${submittedMatchData.finalScore}', but scorecard indicates '${parsedJson.finalScore}'.`
          );
          corrections.push(`Confirm whether '${parsedJson.finalScore}' is the official result.`);
        }
      }

      if (submittedMatchData.winner && parsedJson.winner) {
        const sWin = submittedMatchData.winner.toLowerCase();
        const eWin = String(parsedJson.winner).toLowerCase();
        if (!sWin.includes(eWin) && !eWin.includes(sWin)) {
          inconsistencies.push(
            `Winner discrepancy: Submitted winner '${submittedMatchData.winner}' differs from scorecard '${parsedJson.winner}'.`
          );
        }
      }

      const requiresReview = confidence < 0.85 || inconsistencies.length > 0 || isDuplicate;

      return {
        status: requiresReview ? "HUMAN_REVIEW_REQUIRED" : "EXTRACTED",
        confidenceScore: Math.round(confidence * 100) / 100,
        requiresHumanReview: requiresReview,
        message: requiresReview
          ? `Scorecard processed with ${inconsistencies.length} discrepancy flag(s). Routed to Authorized Officials for verification review.`
          : "Scorecard verified by AI OCR! All fields matched institution submission with high confidence.",
        sha256Hash: sha256,
        isDuplicateEvidence: isDuplicate,
        duplicateMatchNumber: duplicateMatchNumber || undefined,
        extractedData: parsedJson,
        detectedInconsistencies: inconsistencies,
        proposedCorrections: corrections,
      };
    } catch (apiErr: any) {
      console.error("Gemini OCR Processing Error:", apiErr);
      return {
        status: "FAILED",
        confidenceScore: 0,
        requiresHumanReview: true,
        message: `AI OCR processing encountered an error (${apiErr.message}). Routed to manual human verification.`,
        sha256Hash: sha256,
        isDuplicateEvidence: isDuplicate,
        duplicateMatchNumber: duplicateMatchNumber || undefined,
        extractedData: null,
        detectedInconsistencies: ["OCR engine processing failure"],
        proposedCorrections: ["Manual verification by tournament commissioner required"],
      };
    }
  },
};

export default ScorecardOcrService;
