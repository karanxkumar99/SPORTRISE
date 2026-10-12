import dotenv from "dotenv";
dotenv.config();

async function testResend() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "SportRise India <onboarding@resend.dev>";

  console.log("Checking Resend API Key...");
  console.log(`Key Prefix: ${apiKey ? apiKey.slice(0, 10) + "..." : "NONE"}`);
  console.log(`From Address: ${from}`);

  // Check Resend API keys endpoint or send test
  // In Resend, GET https://api.resend.com/api-keys can list keys or GET https://api.resend.com/domains can check domains
  const domainRes = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  console.log("Domains status:", domainRes.status);
  const domainsData = await domainRes.json();
  console.log("Domains Response:", JSON.stringify(domainsData, null, 2));

  // Let's test dispatching an OTP email to verify exact delivery response
  console.log("\nTesting email dispatch via Resend API...");
  // Let's try sending a test email to the account owner or test address
  const testRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: ["delivered@resend.dev"], // Resend's standard sandbox testing recipient
      subject: "🇮🇳 [SPORTRISE] Resend API Connectivity Test",
      html: "<p>Verification service is connected and running.</p>",
    }),
  });

  console.log("Test dispatch HTTP status:", testRes.status);
  const testResult = await testRes.json();
  console.log("Dispatch Response:", JSON.stringify(testResult, null, 2));
}

testResend().catch(console.error);
