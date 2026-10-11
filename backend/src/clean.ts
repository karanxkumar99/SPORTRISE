import { prisma } from "./prisma";

async function cleanDatabase() {
  console.log("🧹 Clearing all database records for a fresh start...");
  await prisma.oTP.deleteMany({});
  await prisma.performanceRecord.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("✨ Database is now completely fresh, clean, and ready for real registrations!");
}

cleanDatabase()
  .catch((err) => {
    console.error("Clean error:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
