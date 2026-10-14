import { prisma } from "../src/prisma";

async function main() {
  console.log("Inspecting current database state...");
  const athletes = await prisma.user.findMany({
    select: { id: true, athleteId: true, fullName: true, email: true, isVerified: true },
  });

  console.log(`Found ${athletes.length} athlete user(s):`);
  athletes.forEach((a) => console.log(` - [${a.athleteId}] ${a.fullName} (${a.email}) - Verified: ${a.isVerified}`));

  // Remove test/temporary athletes and their associated records
  console.log("\nPurging all athlete records and test data...");

  // Delete match participants
  const deletedParticipants = await prisma.matchParticipant.deleteMany({});
  console.log(`Deleted ${deletedParticipants.count} match participant(s)`);

  // Delete ranking histories
  const deletedRankHist = await prisma.rankingHistory.deleteMany({});
  console.log(`Deleted ${deletedRankHist.count} ranking history record(s)`);

  // Delete performance records
  const deletedPerf = await prisma.performanceRecord.deleteMany({});
  console.log(`Deleted ${deletedPerf.count} performance record(s)`);

  // Delete athlete applications
  const deletedApps = await prisma.application.deleteMany({
    where: { userId: { not: null } },
  });
  console.log(`Deleted ${deletedApps.count} student application(s)`);

  // Delete athlete OTPs
  const deletedOtps = await prisma.oTP.deleteMany({
    where: { userType: "ATHLETE" },
  });
  console.log(`Deleted ${deletedOtps.count} athlete OTP(s)`);

  // Delete athlete disputes
  const deletedDisputes = await prisma.dispute.deleteMany({
    where: { raisedByUserId: { not: null } },
  });
  console.log(`Deleted ${deletedDisputes.count} athlete dispute(s)`);

  // Delete all users
  const deletedUsers = await prisma.user.deleteMany({});
  console.log(`Deleted ${deletedUsers.count} athlete user account(s)`);

  const remainingUsers = await prisma.user.count();
  console.log(`\nRemaining Athletes in database: ${remainingUsers}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
