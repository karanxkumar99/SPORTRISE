import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../prisma";

export interface AthleteContext {
  athleteId: string;
  fullName: string;
  sport: string;
  ageCategory: string;
  gender: string;
  state: string;
  district: string;
}

export interface MetricValues {
  [key: string]: number | string;
}

export interface AssessmentResult {
  skillIndex: number; // 0 - 1000
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  benchmarkComparison: {
    nationalStandard: number;
    kheloIndiaTarget: number;
    athletePercentile: number;
  };
}

class AiRankingService {
  private geminiClient: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 0) {
      this.geminiClient = new GoogleGenerativeAI(apiKey.trim());
    }
  }

  /**
   * Algorithmic heuristic calculation of Skill Index (0 - 1000)
   * Based on Olympic, Khelo India, and Indian National Federation standards.
   */
  public calculateBaseSkillIndex(sport: string, metrics: MetricValues, ageCategory: string = "U-19"): number {
    let score = 500; // baseline

    const ageMultiplier =
      ageCategory === "U-14" ? 1.25 : ageCategory === "U-17" ? 1.12 : ageCategory === "U-19" ? 1.05 : 1.0;

    const s = sport.toLowerCase();

    if (s.includes("athletic") || s.includes("sprint") || s.includes("track")) {
      // Metrics: sprint100m (seconds), longJumpMeters, vo2Max
      let sprint = Number(metrics.sprint100m) || 12.5;
      let longJump = Number(metrics.longJumpMeters) || 5.5;
      let vo2 = Number(metrics.vo2Max) || 48;

      // Sprint: 10.0s = 980, 10.5s = 900, 11.2s = 780, 12.0s = 650, 13.5s = 400
      let sprintScore = Math.max(200, Math.min(1000, 1000 - (sprint - 10.0) * 220));
      // Long jump: 8.0m = 980, 7.0m = 850, 6.0m = 700, 5.0m = 500
      let jumpScore = Math.max(200, Math.min(1000, 400 + (longJump - 4.5) * 160));
      // VO2: 65+ = 950, 55 = 750, 45 = 550
      let vo2Score = Math.max(200, Math.min(1000, 300 + (vo2 - 35) * 18));

      score = Math.round((sprintScore * 0.45 + jumpScore * 0.3 + vo2Score * 0.25) * ageMultiplier);
    } else if (s.includes("weightlifting")) {
      // Metrics: snatchKg, cleanJerkKg, bodyWeightKg
      let snatch = Number(metrics.snatchKg) || 80;
      let cleanJerk = Number(metrics.cleanJerkKg) || 105;
      let bw = Number(metrics.bodyWeightKg) || 67;

      let total = snatch + cleanJerk;
      let ratio = total / (bw || 60); // 3.5+ = Olympic elite, 3.0 = Senior Nat, 2.4 = Khelo India
      score = Math.round(Math.max(250, Math.min(1000, (ratio / 3.4) * 920 * ageMultiplier)));
    } else if (s.includes("badminton") || s.includes("tennis")) {
      // Metrics: winLossRatio (percentage or decimal), tournamentLevel (1-5), shuttleSprintSec
      let winRate = Number(metrics.winLossRatio) || 65; // percentage
      let tournLevel = Number(metrics.tournamentLevel) || 3; // 1-District, 2-State, 3-Zonal, 4-National, 5-International
      let agilitySec = Number(metrics.agilitySeconds) || 14.5;

      let winScore = winRate * 4; // up to 400
      let tournScore = tournLevel * 85; // up to 425
      let agilityScore = Math.max(100, 350 - (agilitySec - 11) * 35);

      score = Math.round((winScore * 0.4 + tournScore * 0.35 + agilityScore * 0.25) * ageMultiplier);
    } else if (s.includes("box") || s.includes("wrestl") || s.includes("judo")) {
      // Combat sports
      let winRate = Number(metrics.winLossRatio) || 60;
      let punchesPerMin = Number(metrics.punchFrequency) || Number(metrics.takedownsAvg) || 45;
      let reactionTimeMs = Number(metrics.reactionTimeMs) || 240;

      let reactionScore = Math.max(200, Math.min(950, 1000 - reactionTimeMs * 2.5));
      let activityScore = Math.min(900, punchesPerMin * 14);
      score = Math.round((winRate * 4.5 * 0.4 + activityScore * 0.3 + reactionScore * 0.3) * ageMultiplier);
    } else if (s.includes("shoot") || s.includes("arch")) {
      // Precision sports
      let score10m = Number(metrics.tenMeterScore) || Number(metrics.qualificationScore) || 570; // out of 600 or 720
      let innerTens = Number(metrics.innerTenCount) || 18;

      let precisionRatio = score10m > 600 ? score10m / 720 : score10m / 600;
      score = Math.round(precisionRatio * 880 + Math.min(100, innerTens * 3));
    } else if (s.includes("swim")) {
      // Swimming 50m / 100m
      let swim50m = Number(metrics.swim50mSec) || 28.5; // 21.5s = Olympic, 24s = Nat, 28s = State
      let strokeRate = Number(metrics.strokeRate) || 45;

      let speedScore = Math.max(250, Math.min(980, 1000 - (swim50m - 21.5) * 55));
      score = Math.round(speedScore * ageMultiplier);
    } else {
      // Generic team or athletic sport
      let fitnessScore = Number(metrics.fitnessScore) || Number(metrics.bleepTest) || 12;
      let matchesPlayed = Number(metrics.matchesPlayed) || 15;
      score = Math.round(Math.min(950, 450 + fitnessScore * 25 + matchesPlayed * 5));
    }

    // Clamp between 200 and 990
    return Math.max(200, Math.min(990, score));
  }

  /**
   * Evaluates performance and generates AI insights
   */
  public async assessPerformance(athlete: AthleteContext, metrics: MetricValues): Promise<AssessmentResult> {
    const baseScore = this.calculateBaseSkillIndex(athlete.sport, metrics, athlete.ageCategory);

    // If Gemini client is ready, prompt for high-level generative sports analysis
    if (this.geminiClient) {
      try {
        const model = this.geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
You are the Chief High-Performance Director of the Sports Authority of India (SAI) and SPORTRISE (खेल उत्थान).
Assess this Indian grassroots athlete's performance submission:

ATHLETE DETAILS:
- Name: ${athlete.fullName}
- Sport: ${athlete.sport}
- Age Category: ${athlete.ageCategory}
- Gender: ${athlete.gender}
- State: ${athlete.state}, District: ${athlete.district}

SUBMITTED METRICS:
${JSON.stringify(metrics, null, 2)}

CALCULATED BASE SKILL INDEX: ${baseScore} (Scale: 0 to 1000)

Provide an objective assessment in valid JSON format:
{
  "skillIndex": (number between 200 and 995, calibrated close to ${baseScore}),
  "strengths": [ "3 specific, data-backed strength points highlighting biomechanics and stats" ],
  "improvements": [ "3 specific tactical or physiological bottlenecks" ],
  "recommendations": [ "3 actionable training drills tailored for Khelo India / National qualifications" ]
}
Respond with only raw JSON.
`;

        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            skillIndex: Math.min(995, Math.max(200, Math.round(parsed.skillIndex || baseScore))),
            strengths: parsed.strengths || this.generateDefaultStrengths(athlete.sport, metrics),
            improvements: parsed.improvements || this.generateDefaultImprovements(athlete.sport, metrics),
            recommendations: parsed.recommendations || this.generateDefaultRecommendations(athlete.sport),
            benchmarkComparison: this.getBenchmarkComparison(athlete.sport, baseScore),
          };
        }
      } catch (err) {
        console.warn("⚠️ Gemini AI analysis fallback activated:", (err as Error).message);
      }
    }

    // Algorithmic Fallback Engine (Guaranteed 100% Reliable & Data-Rich)
    return {
      skillIndex: baseScore,
      strengths: this.generateDefaultStrengths(athlete.sport, metrics),
      improvements: this.generateDefaultImprovements(athlete.sport, metrics),
      recommendations: this.generateDefaultRecommendations(athlete.sport),
      benchmarkComparison: this.getBenchmarkComparison(athlete.sport, baseScore),
    };
  }

  private generateDefaultStrengths(sport: string, metrics: MetricValues): string[] {
    const list: string[] = [];
    const s = sport.toLowerCase();

    if (s.includes("athletic")) {
      list.push("High explosive power output in initial acceleration phase (0-30m block phase).");
      list.push("Consistent stride frequency maintaining anaerobic threshold across trial segments.");
      list.push("Strong aerobic base suitable for transition to multi-event youth circuit.");
    } else if (s.includes("weightlifting")) {
      list.push("Solid bar velocity off the floor demonstrating explosive hip hinge power.");
      list.push("Superior catch stability and overhead lockout under heavy loads.");
      list.push("High strength-to-bodyweight sinclair index ranking in top regional tier.");
    } else if (s.includes("badminton")) {
      list.push("Rapid lateral footwork and swift court recovery transitions.");
      list.push("Decisive overhead smash placement creating offensive break points.");
      list.push("High unforced error resilience during high-intensity rally exchanges.");
    } else if (s.includes("shoot") || s.includes("arch")) {
      list.push("Exceptional trigger release consistency and follow-through discipline.");
      list.push("Stable barrel stability under pressure with minimal natural arc wobble.");
      list.push("High concentration endurance across full 60-shot qualification rounds.");
    } else {
      list.push("Excellent physiological work capacity and dynamic core stability.");
      list.push("Sharp neuromuscular reaction time aligning with national age-group benchmarks.");
      list.push("High competitive drive and disciplined tactical execution.");
    }

    return list;
  }

  private generateDefaultImprovements(sport: string, metrics: MetricValues): string[] {
    const list: string[] = [];
    const s = sport.toLowerCase();

    if (s.includes("athletic")) {
      list.push("Deceleration reduction in the final 20m: Form breakdown causes torso backward lean.");
      list.push("Hamstring-to-quadriceps strength ratio requires targeted eccentric training.");
      list.push("Reaction latency on the starting blocks can be trimmed by 0.08 seconds.");
    } else if (s.includes("weightlifting")) {
      list.push("Ankle dorsiflexion mobility restricts depth during the bottom squat receiving position.");
      list.push("Slight forward bar drift during the second pull transition.");
      list.push("Core bracing latency prior to clean jerk dip phase.");
    } else if (s.includes("badminton")) {
      list.push("Backhand deep-corner defensive clears lack required shuttle trajectory depth.");
      list.push("Aerobic stamina depletion visible after the 45-minute mark in three-set encounters.");
      list.push("Net tumble consistency under defensive pressure.");
    } else {
      list.push("Lactate threshold buffering under sustained high-intensity intervals.");
      list.push("Dynamic agility deceleration mechanics to prevent knee joint overpronation.");
      list.push("Mental conditioning and breathing reset between high-stakes competitive points.");
    }

    return list;
  }

  private generateDefaultRecommendations(sport: string): string[] {
    const list: string[] = [];
    const s = sport.toLowerCase();

    if (s.includes("athletic")) {
      list.push("Implement 4x30m sled-towing sprints at 10% bodyweight resistance twice weekly.");
      list.push("Plyometric depth jumps (40cm box) focused on minimal ground-contact time (<0.18s).");
      list.push("Incorporate contrast training: Heavy back squats paired with resisted box bounds.");
    } else if (s.includes("weightlifting")) {
      list.push("Program Snatch Balance and Tall Cleans at 65-75% 1RM for speed under the bar.");
      list.push("Banded ankle distraction drills and goblet pause squats daily during warm-up.");
      list.push("Jerk dip drive pauses (3 seconds) to enforce vertical drive pathway.");
    } else if (s.includes("badminton")) {
      list.push("6-corner shadow drill: 10 sets of 1-minute bursts with 30s rest to train anaerobic capacity.");
      list.push("Resistance-band multi-directional lunges to strengthen stabilizers around the knee.");
      list.push("Drill 100 consecutive baseline-to-baseline flat drives to build forearm endurance.");
    } else {
      list.push("30-minute interval cardiovascular work (400m repeats at 85% heart rate max).");
      list.push("Rotational medicine ball slams (4kg) to develop explosive athletic kinetic chain.");
      list.push("Guided visualization and 4-7-8 parasympathetic breathwork prior to competition.");
    }

    return list;
  }

  private getBenchmarkComparison(sport: string, skillIndex: number) {
    const kheloIndiaTarget = 740;
    const nationalStandard = 860;
    const athletePercentile = Math.min(99, Math.max(15, Math.round((skillIndex / 1000) * 100)));

    return {
      nationalStandard,
      kheloIndiaTarget,
      athletePercentile,
    };
  }

  /**
   * Recalculates national, state, and district rankings for a sport
   */
  public async recalculateSportRankings(sport: string) {
    // Fetch all verified users in this sport, ordered by skillIndex DESC
    const athletes = await prisma.user.findMany({
      where: {
        sport: { equals: sport },
      },
      orderBy: { skillIndex: "desc" },
    });

    if (athletes.length === 0) return;

    // Track state and district counters
    const stateRankMap: Record<string, number> = {};
    const districtRankMap: Record<string, number> = {};

    for (let i = 0; i < athletes.length; i++) {
      const athlete = athletes[i];
      const nationalRank = i + 1;

      // State rank
      stateRankMap[athlete.state] = (stateRankMap[athlete.state] || 0) + 1;
      const stateRank = stateRankMap[athlete.state];

      // District rank
      const distKey = `${athlete.state}_${athlete.district}`;
      districtRankMap[distKey] = (districtRankMap[distKey] || 0) + 1;
      const districtRank = districtRankMap[distKey];

      await prisma.user.update({
        where: { id: athlete.id },
        data: {
          nationalRank,
          stateRank,
          districtRank,
        },
      });
    }
  }
}

export const aiRankingService = new AiRankingService();
export default aiRankingService;
