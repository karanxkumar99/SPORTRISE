import bcrypt from "bcryptjs";
import { prisma } from "../src/prisma";
import aiRankingService from "../src/services/aiRanking.service";

async function main() {
  console.log("🌱 Starting SPORTRISE database seeding...");

  // Clear existing data safely
  await prisma.oTP.deleteMany({});
  await prisma.performanceRecord.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPassword = await bcrypt.hash("Athlete@2026", 10);

  const sampleAthletes = [
    {
      athleteId: "SR-IND-26-ATH-10001",
      fullName: "Arjun Singh",
      mobile: "+919876543210",
      email: "arjun.athletics@sportrise.in",
      password: defaultPassword,
      state: "Haryana",
      district: "Panipat",
      sport: "Athletics",
      ageCategory: "U-19",
      gender: "Male",
      isVerified: true,
      skillIndex: 885,
      bio: "100m Sprinter & Long Jumper aiming for Khelo India Youth Games Gold.",
      metrics: { sprint100m: 10.65, longJumpMeters: 7.42, vo2Max: 64 },
    },
    {
      athleteId: "SR-IND-26-ATH-10002",
      fullName: "Sneha Patil",
      mobile: "+919811122233",
      email: "sneha.patil@sportrise.in",
      password: defaultPassword,
      state: "Maharashtra",
      district: "Pune",
      sport: "Athletics",
      ageCategory: "U-17",
      gender: "Female",
      isVerified: true,
      skillIndex: 840,
      bio: "100m & 200m youth sprinter from Pune Sports Academy.",
      metrics: { sprint100m: 11.85, longJumpMeters: 6.15, vo2Max: 59 },
    },
    {
      athleteId: "SR-IND-26-ATH-10003",
      fullName: "Manpreet Singh",
      mobile: "+919822233344",
      email: "manpreet.sprint@sportrise.in",
      password: defaultPassword,
      state: "Punjab",
      district: "Jalandhar",
      sport: "Athletics",
      ageCategory: "Senior",
      gender: "Male",
      isVerified: true,
      skillIndex: 810,
      bio: "Senior National circuit sprinter.",
      metrics: { sprint100m: 10.82, longJumpMeters: 7.1, vo2Max: 61 },
    },
    {
      athleteId: "SR-IND-26-BAD-20001",
      fullName: "Ananya Sharma",
      mobile: "+919833344455",
      email: "ananya.badminton@sportrise.in",
      password: defaultPassword,
      state: "Karnataka",
      district: "Bengaluru Urban",
      sport: "Badminton",
      ageCategory: "U-17",
      gender: "Female",
      isVerified: true,
      skillIndex: 895,
      bio: "Prakash Padukone Academy cadet trainee. State Junior Champion.",
      metrics: { winLossRatio: 84, tournamentLevel: 4, agilitySeconds: 12.8 },
    },
    {
      athleteId: "SR-IND-26-BAD-20002",
      fullName: "Rohit Nair",
      mobile: "+919844455566",
      email: "rohit.badminton@sportrise.in",
      password: defaultPassword,
      state: "Kerala",
      district: "Ernakulam",
      sport: "Badminton",
      ageCategory: "U-19",
      gender: "Male",
      isVerified: true,
      skillIndex: 825,
      bio: "Singles player training under SAI Kerala center.",
      metrics: { winLossRatio: 76, tournamentLevel: 3, agilitySeconds: 13.4 },
    },
    {
      athleteId: "SR-IND-26-BOX-30001",
      fullName: "Virender Kumar",
      mobile: "+919855566677",
      email: "virender.boxing@sportrise.in",
      password: defaultPassword,
      state: "Haryana",
      district: "Bhiwani",
      sport: "Boxing",
      ageCategory: "U-19",
      gender: "Male",
      isVerified: true,
      skillIndex: 870,
      bio: "Bhiwani Boxing Club 63.5kg Light Welterweight.",
      metrics: { winLossRatio: 82, punchFrequency: 68, reactionTimeMs: 195 },
    },
    {
      athleteId: "SR-IND-26-WRE-40001",
      fullName: "Pooja Dahiya",
      mobile: "+919866677788",
      email: "pooja.wrestling@sportrise.in",
      password: defaultPassword,
      state: "Haryana",
      district: "Rohtak",
      sport: "Wrestling",
      ageCategory: "U-19",
      gender: "Female",
      isVerified: true,
      skillIndex: 910,
      bio: "57kg Freestyle wrestler, Chhatrasal akhada junior trainee.",
      metrics: { winLossRatio: 88, takedownsAvg: 6.2, reactionTimeMs: 185 },
    },
    {
      athleteId: "SR-IND-26-SHT-50001",
      fullName: "Dhruv Rastogi",
      mobile: "+919877788899",
      email: "dhruv.shooting@sportrise.in",
      password: defaultPassword,
      state: "Uttar Pradesh",
      district: "Meerut",
      sport: "Shooting",
      ageCategory: "U-17",
      gender: "Male",
      isVerified: true,
      skillIndex: 890,
      bio: "10m Air Pistol national junior squad trials medalist.",
      metrics: { tenMeterScore: 582, innerTenCount: 26, consistencyScore: 96 },
    },
    {
      athleteId: "SR-IND-26-WLT-60001",
      fullName: "Nganba Meitei",
      mobile: "+919888899900",
      email: "nganba.weightlifting@sportrise.in",
      password: defaultPassword,
      state: "Manipur",
      district: "Imphal West",
      sport: "Weightlifting",
      ageCategory: "U-19",
      gender: "Male",
      isVerified: true,
      skillIndex: 920,
      bio: "67kg Category lifter, Manipur State Sports Academy.",
      metrics: { snatchKg: 124, cleanJerkKg: 156, bodyWeightKg: 66.5 },
    },
    {
      athleteId: "SR-IND-26-HOC-70001",
      fullName: "Deep Grace Toppo",
      mobile: "+919899900011",
      email: "deep.hockey@sportrise.in",
      password: defaultPassword,
      state: "Odisha",
      district: "Sundargarh",
      sport: "Hockey",
      ageCategory: "U-19",
      gender: "Female",
      isVerified: true,
      skillIndex: 865,
      bio: "Defender & drag-flick specialist from Sundargarh hockey cradle.",
      metrics: { bleepTest: 20.8, matchesPlayed: 45, dragFlickSpeedKmph: 112 },
    },
  ];

  for (const athleteData of sampleAthletes) {
    const { metrics, ...userData } = athleteData;
    const user = await prisma.user.create({
      data: userData,
    });

    // Create realistic initial performance record
    await prisma.performanceRecord.create({
      data: {
        userId: user.id,
        sport: user.sport,
        metrics: JSON.stringify(metrics),
        skillIndex: user.skillIndex,
        aiStrengths: JSON.stringify([
          "Exceptional anaerobic power output and tactical discipline.",
          "Strong biometric profile exceeding regional qualification threshold.",
          "High training consistency logged across 12-week preparation block.",
        ]),
        aiImprovements: JSON.stringify([
          "Fine-tune recovery pacing in multi-heat tournament days.",
          "Optimize post-activation potentiation routine in warm-up.",
        ]),
        aiRecommendations: JSON.stringify([
          "Targeted contrast plyometrics twice per week.",
          "Hydration and electrolytes monitoring during peak loads.",
        ]),
      },
    });
  }

  // Recalculate rankings for all sports
  const sports = ["Athletics", "Badminton", "Boxing", "Wrestling", "Shooting", "Weightlifting", "Hockey"];
  for (const s of sports) {
    await aiRankingService.recalculateSportRankings(s);
  }

  console.log(`✅ Seeded ${sampleAthletes.length} verified athletes across Indian states with AI scores!`);
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
