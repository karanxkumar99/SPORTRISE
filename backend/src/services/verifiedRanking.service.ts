import { prisma } from "../prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface SportMetricStats {
  [key: string]: any;
}

export interface CalculatedPlayerScore {
  rawScore: number;
  normalizedScore: number; // 0 - 100
  matchRating: number;
}

export const VerifiedRankingService = {
  MODEL_VERSION: "v2.0-verified-hybrid",

  /**
   * Deterministic 0 - 100 Match Performance Rating per Sport
   */
  calculateMatchPlayerRating(sport: string, stats: SportMetricStats, matchOutcome: "WON" | "LOST" | "DRAW"): number {
    const s = sport.toLowerCase();
    let score = 50; // Baseline average performance

    // Win/Draw base modifier
    const outcomeBonus = matchOutcome === "WON" ? 8 : matchOutcome === "DRAW" ? 2 : -4;

    if (s.includes("cricket")) {
      const runs = Number(stats.runs) || 0;
      const balls = Number(stats.balls) || (runs > 0 ? runs : 1);
      const wickets = Number(stats.wickets) || 0;
      const overs = Number(stats.overs) || 0;
      const runsConceded = Number(stats.runsConceded) || 0;
      const catches = Number(stats.catches) || 0;

      // Batting impact
      const strikeRate = balls > 0 ? (runs / balls) * 100 : 100;
      const battingScore = runs * 0.8 + (strikeRate > 120 ? 8 : strikeRate > 100 ? 4 : 0);

      // Bowling impact
      const economy = overs > 0 ? runsConceded / overs : 7.0;
      const bowlingScore = wickets * 18 + (economy < 6 ? 10 : economy < 7.5 ? 5 : 0);

      // Fielding impact
      const fieldingScore = catches * 5;

      score = 30 + battingScore * 0.4 + bowlingScore * 0.4 + fieldingScore * 0.2;
    } else if (s.includes("football") || s.includes("soccer")) {
      const goals = Number(stats.goals) || 0;
      const assists = Number(stats.assists) || 0;
      const minutes = Number(stats.minutesPlayed) || 90;
      const tackles = Number(stats.tackles) || 0;
      const cleanSheet = stats.cleanSheet ? 10 : 0;

      const playingTimeWeight = Math.min(minutes / 90, 1.0);
      score = 45 * playingTimeWeight + goals * 18 + assists * 12 + tackles * 3 + cleanSheet;
    } else if (s.includes("basketball")) {
      const points = Number(stats.points) || 0;
      const rebounds = Number(stats.rebounds) || 0;
      const assists = Number(stats.assists) || 0;
      const steals = Number(stats.steals) || 0;
      const blocks = Number(stats.blocks) || 0;

      score = 25 + points * 1.5 + rebounds * 2.0 + assists * 2.5 + steals * 3.0 + blocks * 3.0;
    } else if (s.includes("badminton") || s.includes("table tennis") || s.includes("tennis")) {
      const setsWon = Number(stats.setsWon) || 0;
      const setsLost = Number(stats.setsLost) || 0;
      const pointsScored = Number(stats.pointsScored) || 0;
      const pointsConceded = Number(stats.pointsConceded) || 1;

      const setDiff = setsWon - setsLost;
      const pointRatio = pointsScored / pointsConceded;

      score = 50 + setDiff * 15 + (pointRatio - 1.0) * 20;
    } else if (s.includes("athletic") || s.includes("sprint") || s.includes("jump") || s.includes("running")) {
      // Benchmark based
      const timingSeconds = Number(stats.timingSeconds) || 0;
      const distanceMeters = Number(stats.distanceMeters) || 0;
      const position = Number(stats.position) || 1;

      const positionBonus = position === 1 ? 25 : position === 2 ? 18 : position === 3 ? 12 : 5;
      score = 55 + positionBonus;
    } else {
      // General sport scoring
      const points = Number(stats.points) || Number(stats.score) || 0;
      score = 50 + Math.min(points * 4, 35);
    }

    score += outcomeBonus;

    // Clamp between 10 and 100
    return Math.round(Math.min(100, Math.max(10, score)) * 10) / 10;
  },

  /**
   * Recalculates athlete official rating across all verified matches
   */
  async recalculateAthleteVerifiedScore(athleteId: string, triggerMatchId?: string) {
    // 1. Fetch athlete and all their verified match participations
    const athlete = await prisma.user.findUnique({
      where: { id: athleteId },
      include: {
        matchParticipations: {
          where: {
            match: {
              status: "VERIFIED",
            },
          },
          include: {
            match: true,
          },
          orderBy: {
            match: {
              matchDate: "desc",
            },
          },
        },
      },
    });

    if (!athlete) return null;

    const verifiedCount = athlete.matchParticipations.length;
    const isProvisional = verifiedCount < 2; // At least 2 verified matches required

    if (verifiedCount === 0) {
      // Athlete has 0 verified matches
      await prisma.user.update({
        where: { id: athlete.id },
        data: {
          verifiedPerformanceScore: 0.0,
          verifiedMatchesCount: 0,
          isProvisional: true,
        },
      });
      return { score: 0.0, isProvisional: true, verifiedCount: 0 };
    }

    // 2. Compute ratings with exponential decay recency weights
    let weightedSum = 0;
    let totalWeight = 0;

    athlete.matchParticipations.forEach((p, idx) => {
      // Recency weight: latest match has weight 1.0, earlier matches decay gracefully
      const recencyWeight = Math.pow(0.9, idx);
      const rating = p.performanceRating || 50;

      weightedSum += rating * recencyWeight;
      totalWeight += recencyWeight;
    });

    const baseScore = totalWeight > 0 ? weightedSum / totalWeight : 50;

    // 3. Consistency bonus: measure deviation
    let consistencyBonus = 0;
    if (verifiedCount >= 3) {
      const ratings = athlete.matchParticipations.map((p) => p.performanceRating || 50);
      const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      const variance = ratings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratings.length;
      const stdDev = Math.sqrt(variance);

      // Low standard deviation indicates reliable, consistent talent
      if (stdDev < 8) consistencyBonus = 3;
      else if (stdDev < 15) consistencyBonus = 1;
    }

    const finalScore = Math.round(Math.min(99.5, Math.max(15, baseScore + consistencyBonus)) * 10) / 10;

    // 4. Update athlete record
    await prisma.user.update({
      where: { id: athlete.id },
      data: {
        verifiedPerformanceScore: finalScore,
        verifiedMatchesCount: verifiedCount,
        isProvisional,
      },
    });

    // 5. Store in RankingHistory idempotently
    if (triggerMatchId) {
      const existingHistory = await prisma.rankingHistory.findFirst({
        where: {
          userId: athlete.id,
          triggerMatchId,
        },
      });

      if (!existingHistory) {
        await prisma.rankingHistory.create({
          data: {
            userId: athlete.id,
            sport: athlete.sport,
            score: finalScore,
            isProvisional,
            modelVersion: this.MODEL_VERSION,
            triggerMatchId,
          },
        });
      }
    }

    return {
      score: finalScore,
      isProvisional,
      verifiedCount,
    };
  },

  /**
   * Recalculates National, State, and District ranks for verified athletes in a sport
   */
  async recalculateSportRankings(sport: string) {
    const athletes = await prisma.user.findMany({
      where: {
        sport,
        isVerified: true,
      },
      orderBy: [
        { isProvisional: "asc" }, // Confirmed ranked athletes first
        { verifiedPerformanceScore: "desc" },
        { skillIndex: "desc" },
      ],
    });

    // Compute national ranks
    let rank = 1;
    for (const athlete of athletes) {
      await prisma.user.update({
        where: { id: athlete.id },
        data: { nationalRank: rank++ },
      });
    }

    // State ranks
    const states = Array.from(new Set(athletes.map((a) => a.state)));
    for (const state of states) {
      const stateAthletes = athletes.filter((a) => a.state === state);
      let sRank = 1;
      for (const athlete of stateAthletes) {
        await prisma.user.update({
          where: { id: athlete.id },
          data: { stateRank: sRank++ },
        });
      }
    }

    // District ranks
    const districts = Array.from(new Set(athletes.map((a) => `${a.state}___${a.district}`)));
    for (const key of districts) {
      const [state, district] = key.split("___");
      const distAthletes = athletes.filter((a) => a.state === state && a.district === district);
      let dRank = 1;
      for (const athlete of distAthletes) {
        await prisma.user.update({
          where: { id: athlete.id },
          data: { districtRank: dRank++ },
        });
      }
    }
  },

  /**
   * Generates or refreshes AI Performance Report based strictly on verified matches
   */
  async generateVerifiedAiReport(athleteId: string) {
    const athlete = await prisma.user.findUnique({
      where: { id: athleteId },
      include: {
        matchParticipations: {
          where: {
            match: { status: "VERIFIED" },
          },
          include: {
            match: {
              select: {
                matchNumber: true,
                competitionName: true,
                sport: true,
                matchDate: true,
                venue: true,
                finalScore: true,
                winner: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 6,
        },
      },
    });

    if (!athlete) return null;

    const matchHistory = athlete.matchParticipations.map((p) => ({
      competition: p.match.competitionName,
      date: p.match.matchDate.toISOString().split("T")[0],
      score: p.match.finalScore,
      winner: p.match.winner,
      team: p.teamName,
      role: p.role,
      rating: p.performanceRating,
      stats: JSON.parse(p.individualStats || "{}"),
    }));

    const verifiedCount = matchHistory.length;

    // Try Gemini API first if key configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 10 && verifiedCount > 0) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
You are SportRise's official sports performance analytics AI engine.
Evaluate this verified athlete data objectively without hallucinating unrecorded stats.

Athlete:
- Name: ${athlete.fullName}
- Sport: ${athlete.sport}
- Category: ${athlete.ageCategory} (${athlete.gender})
- Verified Score: ${athlete.verifiedPerformanceScore}/100
- Verified Matches: ${verifiedCount}
- Match History: ${JSON.stringify(matchHistory, null, 2)}

Return a strict valid JSON object with the following schema:
{
  "summary": "2-3 sentence overview of verified performance",
  "strengths": ["3 verified technical strengths"],
  "weaknesses": ["2 tactical or technical improvement areas"],
  "recentTrends": "Summary of performance trajectory across recent matches",
  "peerComparison": "Comparison with peers in the ${athlete.ageCategory} bracket",
  "factors": ["2-3 key metrics driving the ranking"],
  "recommendations": ["3 specific training drills with clear targets"],
  "confidence": "${verifiedCount >= 3 ? "High (Multiple Verified Matches)" : "Moderate (Early Verified Matches)"}"
}
Only output valid raw JSON, nothing else.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        await prisma.user.update({
          where: { id: athlete.id },
          data: { lastAiReport: JSON.stringify(parsed) },
        });

        return parsed;
      } catch (geminiErr: any) {
        console.warn("[AI-RANKING] Gemini API fallback triggered:", geminiErr.message);
      }
    }

    // Deterministic High-Quality Fallback Report
    const fallbackReport = {
      summary:
        verifiedCount >= 2
          ? `${athlete.fullName} exhibits consistent competitive proficiency in ${athlete.sport} with a verified performance score of ${athlete.verifiedPerformanceScore}/100 across ${verifiedCount} sanctioned matches.`
          : `${athlete.fullName} has recorded initial verified match competition in ${athlete.sport}. Additional verified matches will refine official national calibration.`,
      strengths: [
        `High engagement and verified competition participation in ${athlete.sport}`,
        `Consistent match completion with authenticated institution scorecard records`,
        `Favorable tactical readiness demonstrated in official fixture scorecards`,
      ],
      weaknesses: [
        `Sample depth requires expanding across inter-district and state competitions`,
        `Closing game margins and defensive transition consistency`,
      ],
      recentTrends:
        verifiedCount >= 2
          ? `Positive momentum with stable scoring outputs across recent match appearances.`
          : `Provisional baseline established from initial sanctioned match appearance.`,
      peerComparison: `Tracking solidly against ${athlete.ageCategory} grassroots benchmarks across ${athlete.state}.`,
      factors: [
        `Official scorecard verification by hosting institution`,
        `Direct match contribution and playing time recorded in authenticated fixtures`,
      ],
      recommendations: [
        `Increase competitive match repetitions in sanctioned tournaments`,
        `Focus on sport-specific conditioning drills to maintain high late-game performance ratings`,
        `Review verified match scorecards with institution coaches for tactical refinement`,
      ],
      confidence:
        verifiedCount >= 3
          ? "High (Multiple Verified Matches)"
          : verifiedCount >= 1
          ? "Provisional (Initial Verified Data)"
          : "Insufficient Data",
      generatedAt: new Date().toISOString(),
    };

    await prisma.user.update({
      where: { id: athlete.id },
      data: { lastAiReport: JSON.stringify(fallbackReport) },
    });

    return fallbackReport;
  },
};

export default VerifiedRankingService;
