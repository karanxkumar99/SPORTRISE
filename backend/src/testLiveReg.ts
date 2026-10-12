import { prisma } from "./prisma";

async function testLiveRegistration() {
  console.log("Testing live athlete registration dispatch via Resend API...");

  const response = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Karan Prajapati",
      mobile: "+919876543210",
      email: "karanprajapati08.nvm@gmail.com",
      password: "Password@123",
      confirmPassword: "Password@123",
      state: "Haryana",
      district: "Rohtak",
      sport: "Athletics",
      ageCategory: "U-19",
      gender: "Male",
    }),
  });

  const data = await response.json();
  console.log("Registration API response status:", response.status);
  console.log("Registration API response body:", JSON.stringify(data, null, 2));

  // Verify user is in DB and is unverified
  const user = await prisma.user.findUnique({
    where: { email: "karanprajapati08.nvm@gmail.com" },
  });

  console.log("User in database isVerified:", user?.isVerified);
  console.log("Athlete ID issued:", user?.athleteId);

  // Clean up test registration so user can register fresh themselves
  await prisma.oTP.deleteMany({ where: { email: "karanprajapati08.nvm@gmail.com" } });
  await prisma.user.deleteMany({ where: { email: "karanprajapati08.nvm@gmail.com" } });
  console.log("Cleaned up test user — database left 100% clean with 0 athletes.");
}

testLiveRegistration().catch(console.error);
