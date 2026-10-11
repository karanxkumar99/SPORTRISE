import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { prisma } from "../prisma";
import aiRankingService from "../services/aiRanking.service";
import PerformanceRecordModel from "../models/PerformanceRecord";

export const AiController = {
  /**
   * Evaluates submitted athletic metrics, generates AI feedback, updates user Skill Index & ranking
   */
  async assessAndSavePerformance(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }

      const athlete = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!athlete) {
        return res.status(404).json({ success: false, message: "Athlete not found." });
      }

      const { metrics, sport } = req.body;

      if (!metrics || typeof metrics !== "object" || Object.keys(metrics).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide valid performance metrics.",
        });
      }

      const targetSport = sport || athlete.sport;

      // Run AI assessment
      const assessment = await aiRankingService.assessPerformance(
        {
          athleteId: athlete.athleteId,
          fullName: athlete.fullName,
          sport: targetSport,
          ageCategory: athlete.ageCategory,
          gender: athlete.gender,
          state: athlete.state,
          district: athlete.district,
        },
        metrics
      );

      // Save to database
      const savedRecord = await PerformanceRecordModel.createRecord({
        userId: athlete.id,
        sport: targetSport,
        metrics,
        skillIndex: assessment.skillIndex,
        aiStrengths: assessment.strengths,
        aiImprovements: assessment.improvements,
        aiRecommendations: assessment.recommendations,
      });

      // Update dynamic rankings across state and nation
      await aiRankingService.recalculateSportRankings(targetSport);

      // Fetch fresh updated athlete rank info
      const updatedAthlete = await prisma.user.findUnique({
        where: { id: athlete.id },
        select: {
          id: true,
          athleteId: true,
          skillIndex: true,
          nationalRank: true,
          stateRank: true,
          districtRank: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Performance successfully assessed by SPORTRISE AI!",
        assessment: {
          ...assessment,
          recordId: savedRecord.id,
          recordedAt: savedRecord.recordedAt,
          athleteRanks: {
            nationalRank: updatedAthlete?.nationalRank || 1,
            stateRank: updatedAthlete?.stateRank || 1,
            districtRank: updatedAthlete?.districtRank || 1,
            skillIndex: updatedAthlete?.skillIndex || assessment.skillIndex,
          },
        },
      });
    } catch (err) {
      console.error("AI Performance Assessment Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to evaluate performance with AI engine.",
      });
    }
  },

  /**
   * Preview score without saving
   */
  async previewScore(req: AuthenticatedRequest, res: Response) {
    try {
      const { sport, metrics, ageCategory = "U-19", gender = "Male" } = req.body;

      if (!sport || !metrics) {
        return res.status(400).json({
          success: false,
          message: "Sport and metrics are required for score preview.",
        });
      }

      const assessment = await aiRankingService.assessPerformance(
        {
          athleteId: "PREVIEW",
          fullName: "Athlete",
          sport,
          ageCategory,
          gender,
          state: "All India",
          district: "District",
        },
        metrics
      );

      return res.status(200).json({
        success: true,
        assessment,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Preview calculation failed." });
    }
  },

  /**
   * Retrieve performance assessment log history
   */
  async getPerformanceHistory(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }

      const history = await PerformanceRecordModel.findByUserId(req.user.id);
      return res.status(200).json({
        success: true,
        records: history,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Failed to fetch performance history." });
    }
  },
};

export default AiController;
