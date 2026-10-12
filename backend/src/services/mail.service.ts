import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

interface SendOtpOptions {
  to: string;
  name: string;
  otp: string;
  type?: "ATHLETE" | "INSTITUTION";
}

interface SendWelcomeOptions {
  to: string;
  name: string;
  athleteId?: string;
  sport?: string;
  type?: "ATHLETE" | "INSTITUTION";
}

interface SendMatchStatusOptions {
  to: string;
  institutionName: string;
  matchNumber: string;
  competitionName: string;
  status: "VERIFIED" | "CHANGES_REQUESTED" | "REJECTED";
  reviewerNotes?: string;
}

class MailService {
  private transporter: nodemailer.Transporter | null = null;

  private lastUser: string | null = null;
  private lastPass: string | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "465", 10);
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    if (user && pass && user.length > 3 && pass.length > 3) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
          connectionTimeout: 8000,
          socketTimeout: 8000,
        });
        this.lastUser = user;
        this.lastPass = pass;
      } catch (err: any) {
        console.warn(`[MAIL-INIT] Failed to create SMTP transporter: ${err.message}`);
        this.transporter = null;
      }
    } else {
      this.transporter = null;
    }
  }

  private getTransporter(): nodemailer.Transporter | null {
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();
    if (user && pass && user.length > 3 && pass.length > 3) {
      if (!this.transporter || this.lastUser !== user || this.lastPass !== pass) {
        this.initTransporter();
      }
      return this.transporter;
    }
    return null;
  }

  /**
   * Internal sender supporting Resend API and SMTP fallback
   */
  private async dispatchEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }): Promise<{ success: boolean; method: string; messageId?: string; error?: string }> {
    const fromAddress = process.env.RESEND_FROM || process.env.SMTP_FROM || "SportRise India <onboarding@resend.dev>";
    const resendApiKey = process.env.RESEND_API_KEY;
    const transporter = this.getTransporter();

    // Check if recipient is external and Resend is in free onboarding@resend.dev sandbox mode
    const isResendSandbox = fromAddress.includes("onboarding@resend.dev");

    // 1. Prioritize SMTP Transporter if configured (Delivers to ANY email globally without sandbox limits)
    if (transporter) {
      try {
        const smtpFrom = process.env.SMTP_FROM || `SportRise India <${process.env.SMTP_USER}>` || fromAddress;
        const info = await transporter.sendMail({
          from: smtpFrom,
          to,
          subject,
          html,
        });
        console.log(`\n==================================================`);
        console.log(`✅ [GMAIL SMTP EMAIL DELIVERED DIRECTLY TO INBOX]`);
        console.log(`To: ${to}`);
        console.log(`MessageId: ${info.messageId}`);
        console.log(`==================================================\n`);
        return { success: true, method: "smtp", messageId: info.messageId };
      } catch (err: any) {
        console.warn(`[MAIL-SMTP] Error dispatching to ${to}: ${err.message}`);
      }
    }

    // 2. Try Resend API if API key is provided
    if (resendApiKey && resendApiKey.trim().length > 10) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [to],
            subject,
            html,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`\n==================================================`);
          console.log(`✅ [RESEND EMAIL DELIVERED SUCCESSFULLY]`);
          console.log(`To: ${to}`);
          console.log(`Resend Message ID: ${data?.id}`);
          console.log(`==================================================\n`);
          return { success: true, method: "resend", messageId: data?.id };
        } else {
          const errData = await response.json().catch(() => ({}));
          console.warn(`\n⚠️ [RESEND NOTICE] Status ${response.status}:`, errData.message || JSON.stringify(errData));
        }
      } catch (err: any) {
        console.warn(`[MAIL-RESEND] Network or dispatch error: ${err.message}`);
      }
    }

    // 3. Fallback / Dev Log
    console.log(`\n==================================================`);
    console.log(`📧 [SPORTRISE LOCAL MAIL DISPATCH - DEV FALLBACK]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`==================================================\n`);

    return { success: true, method: "logged" };
  }

  /**
   * Dispatches branded SportRise verification OTP (Athlete or Institution)
   */
  async sendOtpEmail({ to, name, otp, type = "ATHLETE" }: SendOtpOptions) {
    const isInstitution = type === "INSTITUTION";
    const subject = `🇮🇳 [SPORTRISE] ${isInstitution ? "Institution" : "Athlete"} Verification Code: ${otp}`;

    const portalName = isInstitution ? "School & College Event Portal" : "Grassroots Sports Talent Portal";
    const purposeText = isInstitution
      ? `To complete your official institution registration for <strong>${name}</strong> and enable hosting sports tournaments, entering match scorecards, and issuing verified athlete credentials, please enter the following 6-digit verification code:`
      : `Welcome to SportRise! To complete your athlete onboarding and claim your official SportRise Athlete Identity, please enter the following 6-digit verification code:`;

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; margin: 0; padding: 24px; color: #f8fafc; }
        .card { max-width: 540px; margin: 0 auto; background: #131b2e; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 10px 30px rgba(0,0,0,0.6); }
        .tricolor { height: 6px; background: linear-gradient(90deg, #f97316 0%, #f97316 33%, #ffffff 33%, #ffffff 66%, #16a34a 66%, #16a34a 100%); }
        .header { background: #0b1120; padding: 28px 24px; text-align: center; border-bottom: 1px solid #1e293b; }
        .logo { font-size: 26px; font-weight: 800; letter-spacing: 2px; color: #f97316; margin: 0; }
        .sub-logo { font-size: 13px; color: #94a3b8; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 18px; font-weight: 600; color: #ffffff; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-bottom: 24px; }
        .otp-box { background: #0b1120; border: 2px dashed #f97316; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
        .otp-digits { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #fb923c; margin: 0; }
        .badge { display: inline-block; background: #16a34a22; color: #4ade80; border: 1px solid #16a34a44; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; margin-top: 8px; }
        .footer { background: #0b1120; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="tricolor"></div>
        <div class="header">
          <h1 class="logo">SPORTRISE 🇮🇳</h1>
          <div class="sub-logo">खेल उत्थान • ${portalName}</div>
        </div>
        <div class="content">
          <div class="greeting">Namaste ${name},</div>
          <p class="text">${purposeText}</p>
          <div class="otp-box">
            <div class="otp-digits">${otp}</div>
            <div class="badge">Valid for 10 minutes only • Single-use</div>
          </div>
          <p class="text" style="font-size: 13px; color: #94a3b8;">
            Do not share this OTP with anyone. If you did not initiate this request, please safely ignore this email.
          </p>
        </div>
        <div class="footer">
          Empowering Indian Sports Talent across all 28 States & 8 Union Territories.<br/>
          &copy; ${new Date().getFullYear()} SPORTRISE (खेल उत्थान).
        </div>
      </div>
    </body>
    </html>
    `;

    console.log(`\n==================================================`);
    console.log(`🔐 [SPORTRISE VERIFICATION OTP DISPATCH]`);
    console.log(`To: ${to} (${name})`);
    console.log(`Code: >>> [ ${otp} ] <<< (Expires in 10 minutes)`);
    console.log(`==================================================\n`);

    return this.dispatchEmail({ to, subject, html: htmlContent });
  }

  /**
   * Dispatches welcome email upon email verification
   */
  async sendWelcomeEmail({ to, name, athleteId, sport, type = "ATHLETE" }: SendWelcomeOptions) {
    const isInstitution = type === "INSTITUTION";
    const subject = isInstitution
      ? `🏛️ Institution Verified: Welcome ${name} to SportRise`
      : `🎉 Welcome to SportRise! Your Official Athlete ID is ${athleteId}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090d16; margin: 0; padding: 24px; color: #f8fafc; }
        .card { max-width: 540px; margin: 0 auto; background: #131b2e; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; }
        .tricolor { height: 6px; background: linear-gradient(90deg, #f97316 0%, #f97316 33%, #ffffff 33%, #ffffff 66%, #16a34a 66%, #16a34a 100%); }
        .header { background: #0b1120; padding: 28px 24px; text-align: center; border-bottom: 1px solid #1e293b; }
        .content { padding: 32px 28px; }
        .badge-box { background: #0284c715; border: 2px solid #0284c7; padding: 16px; text-align: center; border-radius: 12px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="tricolor"></div>
        <div class="header">
          <h1 style="color:#f97316; margin:0;">SPORTRISE 🇮🇳</h1>
          <p style="color:#94a3b8; margin:4px 0 0 0;">Official Verification Confirmed</p>
        </div>
        <div class="content">
          <h2 style="color:#ffffff;">Congratulations, ${name}!</h2>
          ${
            isInstitution
              ? `<p style="color:#cbd5e1;">Your institution profile has been verified. You can now host tournaments, publish official match scorecards, and upload evidence for review.</p>`
              : `<p style="color:#cbd5e1;">Your athlete profile has been verified successfully for <strong>${sport}</strong>.</p>
                 <div class="badge-box">
                   <span style="font-size: 11px; color: #38bdf8; text-transform: uppercase; font-weight: 700;">Unique SportRise Athlete ID</span><br/>
                   <strong style="font-size: 24px; color: #f8fafc; letter-spacing: 2px;">${athleteId}</strong>
                 </div>
                 <p style="color:#94a3b8; font-size:13px;">Use this unique ID when participating in school, college, or club matches to link verified match stats to your official national profile.</p>`
          }
        </div>
      </div>
    </body>
    </html>
    `;

    return this.dispatchEmail({ to, subject, html: htmlContent });
  }

  /**
   * Match verification status notification to institution
   */
  async sendMatchStatusEmail({
    to,
    institutionName,
    matchNumber,
    competitionName,
    status,
    reviewerNotes,
  }: SendMatchStatusOptions) {
    const statusTitles = {
      VERIFIED: "✅ Match Result Approved & Verified",
      CHANGES_REQUESTED: "⚠️ Changes Requested for Match Submission",
      REJECTED: "❌ Match Submission Rejected",
    };

    const subject = `[SPORTRISE] ${statusTitles[status]}: ${matchNumber} (${competitionName})`;

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090d16; margin: 0; padding: 24px; color: #f8fafc; }
        .card { max-width: 540px; margin: 0 auto; background: #131b2e; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; }
        .header { background: #0b1120; padding: 24px; text-align: center; border-bottom: 1px solid #1e293b; }
        .content { padding: 28px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h2 style="color:#f97316; margin:0;">SPORTRISE MATCH VERIFICATION</h2>
        </div>
        <div class="content">
          <p>Hello ${institutionName},</p>
          <p>The status of match <strong>${matchNumber}</strong> for <strong>${competitionName}</strong> has been updated to:</p>
          <div style="padding:14px; background:#0b1120; border-radius:8px; border-left:4px solid ${
            status === "VERIFIED" ? "#22c55e" : status === "CHANGES_REQUESTED" ? "#eab308" : "#ef4444"
          };">
            <strong style="color:${
              status === "VERIFIED" ? "#4ade80" : status === "CHANGES_REQUESTED" ? "#facc15" : "#f87171"
            }; font-size:16px;">${status}</strong>
            ${reviewerNotes ? `<p style="margin:8px 0 0 0; color:#cbd5e1; font-size:13px;">Reviewer Notes: ${reviewerNotes}</p>` : ""}
          </div>
          <p style="margin-top:20px; font-size:13px; color:#94a3b8;">
            Log into the SportRise Institution Portal to review the scorecard and audit history.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    return this.dispatchEmail({ to, subject, html: htmlContent });
  }
}

export const mailService = new MailService();
export default mailService;
