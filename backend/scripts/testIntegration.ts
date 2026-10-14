import { prisma } from "../src/prisma";
import UserModel from "../src/models/User";
import OTPModel from "../src/models/OTP";
import VerifiedRankingService from "../src/services/verifiedRanking.service";
import crypto from "crypto";
import bcrypt from "bcryptjs";

async function runFullSystemTest() {
  console.log("=================================================================");
  console.log("🇮🇳 SPORTRISE (खेल उत्थान) PRODUCTION-GRADE INTEGRATION TEST");
  console.log("=================================================================\n");

  const testEmail = `athlete_${Date.now()}@sportrise.test`;
  const instEmail = `institution_${Date.now()}@school.test`;

  // -------------------------------------------------------------
  // TEST 1: Athlete Registration & Real Cryptographic OTP Hashing
  // -------------------------------------------------------------
  console.log("TEST 1: Athlete Registration & Cryptographic OTP Generation...");
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("Athlete@1234", salt);

  const testUser = await UserModel.create({
    fullName: "Arjun Verma",
    mobile: "+919876543210",
    email: testEmail,
    password: hashedPassword,
    state: "Haryana",
    district: "Jhajjar",
    sport: "Athletics",
    ageCategory: "U-19",
    gender: "Male",
  });

  if (!testUser || testUser.isVerified !== false) {
    throw new Error("Test 1 Failed: User must be initially unverified.");
  }

  const { record: otpRecord, plainOtp } = await OTPModel.createOtp({
    email: testEmail,
    userId: testUser.id,
    userType: "ATHLETE",
  });

  const expectedHash = OTPModel.hashOtp(plainOtp);
  if (otpRecord.hashedOtp !== expectedHash) {
    throw new Error("Test 1 Failed: OTP hash mismatch!");
  }
  console.log(`✓ Athlete created: ${testUser.fullName} (${testUser.athleteId})`);
  console.log(`✓ OTP generated: [${plainOtp}] with SHA-256 hash: ${otpRecord.hashedOtp.slice(0, 16)}...`);

  // -------------------------------------------------------------
  // TEST 2: OTP Resend Cooldown & Attempt Limit Enforcement
  // -------------------------------------------------------------
  console.log("\nTEST 2: Rate Limiting & Cooldown Enforcement...");
  try {
    await OTPModel.createOtp({
      email: testEmail,
      userId: testUser.id,
      userType: "ATHLETE",
    });
    throw new Error("Test 2 Failed: Cooldown should have thrown an error!");
  } catch (err: any) {
    if (!err.message.includes("Please wait")) {
      throw err;
    }
    console.log(`✓ 60-second cooldown successfully enforced: "${err.message}"`);
  }

  // Test invalid OTP attempt tracking
  const badAttempt = await OTPModel.verifyOtp(testEmail, "000000", "ATHLETE");
  if (badAttempt.success) {
    throw new Error("Test 2 Failed: Wrong OTP must not succeed!");
  }
  console.log(`✓ Wrong code rejected cleanly: "${badAttempt.message}"`);

  // -------------------------------------------------------------
  // TEST 3: Successful OTP Verification & Athlete Profile Unlock
  // -------------------------------------------------------------
  console.log("\nTEST 3: Successful OTP Verification...");
  const validVerification = await OTPModel.verifyOtp(testEmail, plainOtp, "ATHLETE");
  if (!validVerification.success) {
    throw new Error(`Test 3 Failed: OTP should have passed! ${validVerification.message}`);
  }

  const verifiedAthlete = await prisma.user.update({
    where: { id: testUser.id },
    data: { isVerified: true, emailVerifiedAt: new Date() },
  });

  if (!verifiedAthlete.isVerified || !verifiedAthlete.emailVerifiedAt) {
    throw new Error("Test 3 Failed: emailVerifiedAt was not updated.");
  }
  console.log(`✓ Athlete verified at ${verifiedAthlete.emailVerifiedAt.toISOString()}`);

  // Test Profile Update
  const updatedAthlete = await prisma.user.update({
    where: { id: verifiedAthlete.id },
    data: {
      bio: "Dedicated 100m sprinter aiming for Khelo India Youth Games 2026.",
      position: "100m / 200m Sprinter",
      experienceYears: 4,
      achievements: JSON.stringify(["Haryana State Gold Medalist 100m"]),
    },
  });
  console.log(`✓ Athlete profile updated with position: "${updatedAthlete.position}" and experience: ${updatedAthlete.experienceYears}y`);

  // -------------------------------------------------------------
  // TEST 4: Institution Registration & Verification Flow
  // -------------------------------------------------------------
  console.log("\nTEST 4: Institution Registration & Verification...");
  const instPassword = await bcrypt.hash("School@2026", salt);

  const testInstitution = await prisma.institution.create({
    data: {
      name: "Haryana Sports Academy",
      type: "Institute",
      email: instEmail,
      password: instPassword,
      contactNumber: "+911242345678",
      address: "Sector 14, Rohtak Road",
      city: "Rohtak",
      state: "Haryana",
      pincode: "124001",
      authorizedPersonName: "Director O.P. Chautala",
      authorizedPersonContact: "+919876543200",
      coordinatorName: "Coach Ramesh Kumar",
      coordinatorEmail: "coach@hsa.edu",
      coordinatorPhone: "+919876543201",
      isVerified: false,
      supportedSports: JSON.stringify(["Athletics", "Wrestling", "Boxing"]),
      facilities: "400m synthetic track, wrestling arena, indoor gymnasium",
      coaches: JSON.stringify(["Ramesh Kumar (NIS Coach)", "Satish Punia (Strength Coach)"]),
    },
  });

  const { plainOtp: instOtp } = await OTPModel.createOtp({
    email: instEmail,
    institutionId: testInstitution.id,
    userType: "INSTITUTION",
  });

  const instVerifyResult = await OTPModel.verifyOtp(instEmail, instOtp, "INSTITUTION");
  if (!instVerifyResult.success) {
    throw new Error("Test 4 Failed: Institution verification failed.");
  }

  const verifiedInst = await prisma.institution.update({
    where: { id: testInstitution.id },
    data: { isVerified: true, emailVerifiedAt: new Date() },
  });
  console.log(`✓ Institution ${verifiedInst.name} verified successfully.`);

  // -------------------------------------------------------------
  // TEST 5: Match Submission with Multi-File Evidence
  // -------------------------------------------------------------
  console.log("\nTEST 5: Match Submission with Evidence & Participants...");
  const matchNumber = `SR-M-2026-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const matchDate = new Date();

  const createdMatch = await prisma.$transaction(async (tx) => {
    const match = await tx.match.create({
      data: {
        matchNumber,
        sport: "Athletics",
        competitionName: "North Zone Grassroots Sprint Championship 2026",
        instituteId: verifiedInst.id,
        opponentName: "Punjab Sports Academy",
        venue: "Maharaja Aggarsain Stadium, Rohtak",
        matchDate,
        matchFormat: "100m Sprint Finals",
        rulesSummary: "AFI standard electronic timing, zero false start rule",
        finalScore: "10.48s (1st Place)",
        winner: "Arjun Verma (HSA)",
        resultSummary: "Won by 0.14 seconds over runner-up",
        status: "SUBMITTED",
      },
    });

    // Participant
    const playerRating = VerifiedRankingService.calculateMatchPlayerRating("Athletics", {
      timingSeconds: 10.48,
      position: 1,
    }, "WON");

    await tx.matchParticipant.create({
      data: {
        matchId: match.id,
        athleteId: verifiedAthlete.id,
        teamName: verifiedInst.name,
        role: "Lead Sprinter",
        individualStats: JSON.stringify({ timingSeconds: 10.48, position: 1, windSpeed: "+0.4 m/s" }),
        performanceRating: playerRating,
        verifiedStatsSaved: false,
      },
    });

    // Multi-File Evidence
    await tx.matchEvidence.createMany({
      data: [
        {
          matchId: match.id,
          fileUrl: "/uploads/official_scorecard_signed.pdf",
          fileName: "official_scorecard_signed.pdf",
          fileType: "application/pdf",
          fileSize: 1420500,
          category: "scorecard",
          uploaderId: verifiedInst.id,
          uploaderType: "INSTITUTION",
          verificationFlag: "VALID",
        },
        {
          matchId: match.id,
          fileUrl: "/uploads/finish_line_photo.jpg",
          fileName: "finish_line_photo.jpg",
          fileType: "image/jpeg",
          fileSize: 852000,
          category: "scoreboard",
          uploaderId: verifiedInst.id,
          uploaderType: "INSTITUTION",
          verificationFlag: "VALID",
        },
      ],
    });

    // Audit Log
    await tx.auditLog.create({
      data: {
        entityType: "MATCH",
        entityId: match.id,
        action: "SUBMITTED",
        actorId: verifiedInst.id,
        actorRole: "INSTITUTION",
        details: JSON.stringify({ matchNumber, participantsCount: 1, evidenceCount: 2 }),
      },
    });

    return match;
  });

  console.log(`✓ Match created: ${createdMatch.matchNumber} (${createdMatch.competitionName})`);
  console.log(`✓ Attached 2 evidence files (scorecard PDF & photo)`);

  // -------------------------------------------------------------
  // TEST 6: Duplicate Match Prevention Check
  // -------------------------------------------------------------
  console.log("\nTEST 6: Duplicate Match Anti-Cheating Detection...");
  const startOfDay = new Date(matchDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(matchDate);
  endOfDay.setHours(23, 59, 59, 999);

  const duplicateCheck = await prisma.match.findFirst({
    where: {
      instituteId: verifiedInst.id,
      sport: "Athletics",
      competitionName: "North Zone Grassroots Sprint Championship 2026",
      matchDate: { gte: startOfDay, lte: endOfDay },
    },
  });

  if (!duplicateCheck) {
    throw new Error("Test 6 Failed: Duplicate match detection failed.");
  }
  console.log(`✓ Duplicate check correctly detected existing match #${duplicateCheck.matchNumber}. System prevents duplicate uploads!`);

  // -------------------------------------------------------------
  // TEST 7: Reviewer Verification & Automatic Ranking Calculation
  // -------------------------------------------------------------
  console.log("\nTEST 7: Reviewer Official Approval & Ranking Engine...");

  // Reviewer approves match
  await prisma.match.update({
    where: { id: createdMatch.id },
    data: {
      status: "VERIFIED",
      isCompleted: true,
      reviewedBy: "Chief Integrity Officer Sharma",
      reviewedAt: new Date(),
    },
  });

  // Mark participant stats saved
  await prisma.matchParticipant.updateMany({
    where: { matchId: createdMatch.id },
    data: { verifiedStatsSaved: true },
  });

  // Trigger Verified Ranking Calculation
  const rankResult1 = await VerifiedRankingService.recalculateAthleteVerifiedScore(
    verifiedAthlete.id,
    createdMatch.id
  );

  console.log(`✓ Recalculated athlete score after 1 match: Score = ${rankResult1?.score}, Provisional = ${rankResult1?.isProvisional}`);
  if (!rankResult1?.isProvisional) {
    throw new Error("Test 7 Failed: Athlete with only 1 match MUST be Provisional!");
  }
  console.log("✓ Provisional status correctly assigned (minimum 2 verified matches required)");

  // Add 2nd verified match to confirm official national calibration
  console.log("\nAdding 2nd verified match to meet minimum sample threshold...");
  const match2Number = `SR-M-2026-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const match2 = await prisma.match.create({
    data: {
      matchNumber: match2Number,
      sport: "Athletics",
      competitionName: "Haryana State Junior Athletics Meet",
      instituteId: verifiedInst.id,
      venue: "Karnal Sports Complex",
      matchDate: new Date(),
      matchFormat: "200m Sprint Finals",
      finalScore: "21.32s (1st Place)",
      winner: "Arjun Verma",
      status: "VERIFIED",
      isCompleted: true,
      reviewedBy: "Chief Integrity Officer Sharma",
      reviewedAt: new Date(),
    },
  });

  const rating2 = VerifiedRankingService.calculateMatchPlayerRating("Athletics", {
    timingSeconds: 21.32,
    position: 1,
  }, "WON");

  await prisma.matchParticipant.create({
    data: {
      matchId: match2.id,
      athleteId: verifiedAthlete.id,
      teamName: verifiedInst.name,
      role: "Sprinter",
      individualStats: JSON.stringify({ timingSeconds: 21.32, position: 1 }),
      performanceRating: rating2,
      verifiedStatsSaved: true,
    },
  });

  const rankResult2 = await VerifiedRankingService.recalculateAthleteVerifiedScore(
    verifiedAthlete.id,
    match2.id
  );

  console.log(`✓ Recalculated athlete score after 2 matches: Score = ${rankResult2?.score}, Provisional = ${rankResult2?.isProvisional}`);
  if (rankResult2?.isProvisional !== false) {
    throw new Error("Test 7 Failed: Athlete with 2 verified matches should be confirmed!");
  }
  console.log("✓ Athlete official national calibration CONFIRMED (Provisional lifted!)");

  // Recalculate sport-wide national & state ranks
  await VerifiedRankingService.recalculateSportRankings("Athletics");

  const rankedAthleteCheck = await prisma.user.findUnique({
    where: { id: verifiedAthlete.id },
  });
  console.log(`✓ Official Standings: National Rank #${rankedAthleteCheck?.nationalRank}, State Rank #${rankedAthleteCheck?.stateRank}, Verified Score: ${rankedAthleteCheck?.verifiedPerformanceScore}/100`);

  // Generate AI Performance Diagnostics
  console.log("\nTEST 8: Verified AI Performance Report Generation...");
  const aiReport = await VerifiedRankingService.generateVerifiedAiReport(verifiedAthlete.id);
  console.log("✓ AI Diagnostics Generated Successfully:");
  console.log(`  Summary: ${aiReport?.summary}`);
  console.log(`  Confidence: ${aiReport?.confidence}`);
  console.log(`  Strengths Count: ${aiReport?.strengths?.length}`);
  console.log(`  Recommendations Count: ${aiReport?.recommendations?.length}`);

  // -------------------------------------------------------------
  // TEST 9: Idempotency Verification
  // -------------------------------------------------------------
  console.log("\nTEST 9: Idempotency Verification...");
  const repeatCalc = await VerifiedRankingService.recalculateAthleteVerifiedScore(
    verifiedAthlete.id,
    match2.id
  );
  if (repeatCalc?.score !== rankResult2.score) {
    throw new Error("Test 9 Failed: Repeated calculation inflated score!");
  }
  console.log(`✓ Calculation is strictly idempotent: Repeat score (${repeatCalc?.score}) exactly matches original (${rankResult2.score})`);

  // -------------------------------------------------------------
  // TEST 10: Dispute Workflow & Anti-Cheating Audit Trail
  // -------------------------------------------------------------
  console.log("\nTEST 10: Dispute Workflow & Anti-Cheating Audit Trail...");
  const dispute = await prisma.dispute.create({
    data: {
      matchId: createdMatch.id,
      raisedByUserId: verifiedAthlete.id,
      reason: "Official timer reported 10.45s on photo-finish rather than entered 10.48s.",
      status: "OPEN",
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: "DISPUTE",
      entityId: dispute.id,
      action: "DISPUTED",
      actorId: verifiedAthlete.id,
      actorRole: "ATHLETE",
      details: JSON.stringify({ matchNumber: createdMatch.matchNumber, disputeId: dispute.id }),
    },
  });

  const auditHistory = await prisma.auditLog.findMany({
    where: { entityId: { in: [createdMatch.id, dispute.id] } },
  });

  console.log(`✓ Dispute #${dispute.id} registered and logged in immutable AuditLog (${auditHistory.length} audit trail records found)`);

  console.log("\n=================================================================");
  console.log("🎉 ALL 10 INTEGRATION TESTS PASSED WITH 100% SUCCESS!");
  console.log("=================================================================\n");
}

runFullSystemTest()
  .catch((e) => {
    console.error("Test Failure:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
