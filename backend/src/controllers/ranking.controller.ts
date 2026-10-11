import { Request, Response } from "express";
import { prisma } from "../prisma";

export const RankingController = {
  /**
   * Dedicated Olympic sport leaderboard with cascading filters
   */
  async getLeaderboard(req: Request, res: Response) {
    try {
      const {
        sport = "Athletics",
        state,
        district,
        ageCategory,
        gender,
        page = "1",
        limit = "50",
      } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const pageSize = Math.min(100, Math.max(10, parseInt(limit as string, 10) || 50));
      const skip = (pageNum - 1) * pageSize;

      // Construct Prisma query filter
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {
        isVerified: true,
      };

      if (sport && sport !== "All") {
        where.sport = { equals: sport as string };
      }

      if (state && state !== "All" && state !== "All India") {
        where.state = { equals: state as string };
      }

      if (district && district !== "All") {
        where.district = { equals: district as string };
      }

      if (ageCategory && ageCategory !== "All") {
        where.ageCategory = { equals: ageCategory as string };
      }

      if (gender && gender !== "All") {
        where.gender = { equals: gender as string };
      }

      const [athletes, totalCount] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: { skillIndex: "desc" },
          skip,
          take: pageSize,
          select: {
            id: true,
            athleteId: true,
            fullName: true,
            sport: true,
            state: true,
            district: true,
            ageCategory: true,
            gender: true,
            skillIndex: true,
            nationalRank: true,
            stateRank: true,
            districtRank: true,
            createdAt: true,
          },
        }),
        prisma.user.count({ where }),
      ]);

      // Assign contextual rank based on current filter view
      const rankedAthletes = athletes.map((athlete, index) => {
        const contextualRank = skip + index + 1;
        return {
          ...athlete,
          contextualRank,
          badge:
            contextualRank === 1
              ? "Gold"
              : contextualRank === 2
              ? "Silver"
              : contextualRank === 3
              ? "Bronze"
              : contextualRank <= 10
              ? "Top10"
              : "Standard",
        };
      });

      // Sport summary statistics
      const statsAggregate = await prisma.user.aggregate({
        where: {
          sport: sport !== "All" ? (sport as string) : undefined,
          isVerified: true,
        },
        _avg: { skillIndex: true },
        _max: { skillIndex: true },
        _count: { id: true },
      });

      return res.status(200).json({
        success: true,
        data: rankedAthletes,
        pagination: {
          total: totalCount,
          page: pageNum,
          pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
        },
        summary: {
          sport,
          totalAthletes: statsAggregate._count.id || 0,
          averageSkillIndex: Math.round(statsAggregate._avg.skillIndex || 500),
          topSkillIndex: statsAggregate._max.skillIndex || 500,
        },
      });
    } catch (err) {
      console.error("Leaderboard Error:", err);
      return res.status(500).json({ success: false, message: "Failed to generate leaderboard." });
    }
  },

  /**
   * Top state rankings aggregate
   */
  async getStateRankingsSummary(req: Request, res: Response) {
    try {
      const { sport } = req.query;

      // Group athletes by state
      const stateAthletes = await prisma.user.groupBy({
        by: ["state"],
        where: {
          isVerified: true,
          sport: sport && sport !== "All" ? (sport as string) : undefined,
        },
        _count: { id: true },
        _avg: { skillIndex: true },
        orderBy: {
          _avg: { skillIndex: "desc" },
        },
        take: 10,
      });

      return res.status(200).json({
        success: true,
        states: stateAthletes.map((s, idx) => ({
          rank: idx + 1,
          state: s.state,
          athleteCount: s._count.id,
          avgSkillIndex: Math.round(s._avg.skillIndex || 0),
        })),
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Failed to fetch state rankings." });
    }
  },
};

export default RankingController;
