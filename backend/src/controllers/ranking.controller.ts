import { Request, Response } from "express";
import { prisma } from "../prisma";

export const RankingController = {
  /**
   * Dedicated sport leaderboard with cascading filters & provisional badge support
   */
  async getLeaderboard(req: Request, res: Response) {
    try {
      const {
        sport = "Athletics",
        state,
        district,
        ageCategory,
        gender,
        provisional, // "all" | "confirmed_only" | "provisional_only"
        page = "1",
        limit = "50",
      } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const pageSize = Math.min(100, Math.max(10, parseInt(limit as string, 10) || 50));
      const skip = (pageNum - 1) * pageSize;

      // Construct Prisma query filter
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

      if (provisional === "confirmed_only") {
        where.isProvisional = false;
      } else if (provisional === "provisional_only") {
        where.isProvisional = true;
      }

      const [athletes, totalCount] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: [
            { isProvisional: "asc" }, // Confirmed ranked athletes top
            { verifiedPerformanceScore: "desc" },
            { skillIndex: "desc" },
          ],
          skip,
          take: pageSize,
          select: {
            id: true,
            athleteId: true,
            fullName: true,
            sport: true,
            position: true,
            avatarUrl: true,
            state: true,
            district: true,
            ageCategory: true,
            gender: true,
            skillIndex: true,
            verifiedPerformanceScore: true,
            isProvisional: true,
            verifiedMatchesCount: true,
            nationalRank: true,
            stateRank: true,
            districtRank: true,
            createdAt: true,
            matchParticipations: {
              where: {
                match: { status: "VERIFIED" },
              },
              take: 1,
              orderBy: {
                match: { matchDate: "desc" },
              },
              select: {
                placement: true,
                position: true,
                individualStats: true,
                performanceRating: true,
                match: {
                  select: {
                    competitionName: true,
                    matchFormat: true,
                    matchDate: true,
                  },
                },
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      // Assign contextual rank based on current filter view
      const rankedAthletes = athletes.map((athlete: any, index) => {
        const contextualRank = skip + index + 1;
        const latest = athlete.matchParticipations?.[0];
        let recentSummary = "";
        if (latest) {
          let stats: any = {};
          if (typeof latest.individualStats === "string") {
            try {
              stats = JSON.parse(latest.individualStats);
            } catch {
              stats = {};
            }
          } else {
            stats = latest.individualStats || {};
          }
          const placement = latest.placement ? `${latest.placement}` : "";
          const statValues = Object.entries(stats).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(" • ");
          recentSummary = placement ? `${placement} (${statValues})` : statValues;
        }

        return {
          ...athlete,
          contextualRank,
          recentPerformance: recentSummary || athlete.position || "Active Contender",
          badge: athlete.isProvisional
            ? "Provisional"
            : contextualRank === 1
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
        _avg: { verifiedPerformanceScore: true, skillIndex: true },
        _max: { verifiedPerformanceScore: true },
        _count: { id: true },
      });

      const confirmedAthletesCount = await prisma.user.count({
        where: {
          sport: sport !== "All" ? (sport as string) : undefined,
          isVerified: true,
          isProvisional: false,
        },
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
          confirmedRankedAthletes: confirmedAthletesCount,
          averageScore: Math.round((statsAggregate._avg.verifiedPerformanceScore || 50) * 10) / 10,
          topScore: statsAggregate._max.verifiedPerformanceScore || 0,
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

      const stateAthletes = await prisma.user.groupBy({
        by: ["state"],
        where: {
          isVerified: true,
          sport: sport && sport !== "All" ? (sport as string) : undefined,
        },
        _count: { id: true },
        _avg: { verifiedPerformanceScore: true },
        orderBy: {
          _avg: { verifiedPerformanceScore: "desc" },
        },
        take: 10,
      });

      return res.status(200).json({
        success: true,
        states: stateAthletes.map((s, idx) => ({
          rank: idx + 1,
          state: s.state,
          athleteCount: s._count.id,
          avgScore: Math.round((s._avg.verifiedPerformanceScore || 0) * 10) / 10,
        })),
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Failed to fetch state rankings." });
    }
  },
};

export default RankingController;
