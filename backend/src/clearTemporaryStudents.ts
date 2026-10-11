import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearStudents() {
  console.log("Cleaning database to keep it 100% fresh...");

  // Delete all applications
  const deletedApps = await prisma.application.deleteMany({});
  console.log(`Deleted ${deletedApps.count} application(s).`);

  // Delete all performance records
  const deletedRecords = await prisma.performanceRecord.deleteMany({});
  console.log(`Deleted ${deletedRecords.count} performance record(s).`);

  // Delete all OTPs
  const deletedOtps = await prisma.oTP.deleteMany({});
  console.log(`Deleted ${deletedOtps.count} OTP record(s).`);

  // Delete all temporary athlete/student users
  const deletedUsers = await prisma.user.deleteMany({});
  console.log(`Deleted ${deletedUsers.count} athlete user(s).`);

  console.log("Database is now completely clean and fresh with 0 temporary athletes or applications!");
}

clearStudents()
  .catch((e) => {
    console.error("Cleanup error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
