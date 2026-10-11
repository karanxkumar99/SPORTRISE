import nodemailer from "nodemailer";

interface SendOtpOptions {
  to: string;
  name: string;
  otp: string;
}

interface SendWelcomeOptions {
  to: string;
  name: string;
  athleteId: string;
  sport: string;
}

class MailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST || "smtp.ethereal.email";
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        connectionTimeout: 5000,
        socketTimeout: 5000,
      });
    } else {
      // Development mode / fallback
      this.transporter = null;
    }
  }

  /**
   * Dispatches branded SportRise verification OTP
   */
  async sendOtpEmail({ to, name, otp }: SendOtpOptions): Promise<{ success: boolean; previewUrl?: string }> {
    const from = process.env.SMTP_FROM || "SportRise India <support@sportrise.in>";
    const subject = `🇮🇳 [SPORTRISE] Your 6-Digit Verification Code: ${otp}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #f8fafc; }
        .card { max-width: 540px; margin: 0 auto; background: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .tricolor { height: 6px; background: linear-gradient(90deg, #f97316 0%, #f97316 33%, #ffffff 33%, #ffffff 66%, #16a34a 66%, #16a34a 100%); }
        .header { background: #0f172a; padding: 28px 24px; text-align: center; border-bottom: 1px solid #334155; }
        .logo { font-size: 26px; font-weight: 800; letter-spacing: 2px; color: #f97316; margin: 0; }
        .sub-logo { font-size: 13px; color: #94a3b8; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 18px; font-weight: 600; color: #ffffff; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-bottom: 24px; }
        .otp-box { background: #0f172a; border: 2px dashed #f97316; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
        .otp-digits { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #fb923c; margin: 0; }
        .badge { display: inline-block; background: #16a34a22; color: #4ade80; border: 1px solid #16a34a44; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; margin-top: 8px; }
        .footer { background: #0f172a; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #334155; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="tricolor"></div>
        <div class="header">
          <h1 class="logo">SPORTRISE 🇮🇳</h1>
          <div class="sub-logo">खेल उत्थान • Grassroots Sports Talent Portal</div>
        </div>
        <div class="content">
          <div class="greeting">Namaste ${name},</div>
          <p class="text">
            Welcome to SportRise! To complete your athlete onboarding and claim your official SportRise Athlete Identity, please enter the following 6-digit verification code:
          </p>
          <div class="otp-box">
            <div class="otp-digits">${otp}</div>
            <div class="badge">Valid for 10 minutes only</div>
          </div>
          <p class="text" style="font-size: 13px; color: #94a3b8;">
            Do not share this OTP with anyone. If you did not request this verification, please safely ignore this email.
          </p>
        </div>
        <div class="footer">
          Empowering Indian Athletes across all 28 States & 8 Union Territories.<br/>
          &copy; ${new Date().getFullYear()} SPORTRISE (खेल उत्थान). Ministry-aligned grassroots talent registry.
        </div>
      </div>
    </body>
    </html>
    `;

    console.log(`\n==================================================`);
    console.log(`📧 [SPORTRISE EMAIL DISPATCH]`);
    console.log(`To: ${to} (${name})`);
    console.log(`OTP Code: >>> [ ${otp} ] <<< (Expires in 10 mins)`);
    console.log(`==================================================\n`);

    if (!this.transporter) {
      return { success: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        html: htmlContent,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      return { success: true, previewUrl: previewUrl ? String(previewUrl) : undefined };
    } catch (error) {
      console.warn("⚠️ SMTP dispatch notice (OTP logged above):", (error as Error).message);
      return { success: true };
    }
  }

  /**
   * Dispatches welcome email with Athlete ID
   */
  async sendWelcomeEmail({ to, name, athleteId, sport }: SendWelcomeOptions) {
    const from = process.env.SMTP_FROM || "SportRise India <support@sportrise.in>";
    const subject = `🎉 Welcome to SportRise! Your Official Athlete ID is ${athleteId}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #f8fafc; }
        .card { max-width: 540px; margin: 0 auto; background: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155; }
        .tricolor { height: 6px; background: linear-gradient(90deg, #f97316 0%, #f97316 33%, #ffffff 33%, #ffffff 66%, #16a34a 66%, #16a34a 100%); }
        .header { background: #0f172a; padding: 28px 24px; text-align: center; border-bottom: 1px solid #334155; }
        .content { padding: 32px 28px; }
        .id-badge { background: #0284c715; border: 2px solid #0284c7; padding: 14px; text-align: center; border-radius: 12px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="tricolor"></div>
        <div class="header">
          <h1 style="color:#f97316; margin:0;">SPORTRISE 🇮🇳</h1>
          <p style="color:#94a3b8; margin:4px 0 0 0;">Registration Confirmed</p>
        </div>
        <div class="content">
          <h2>Congratulations, ${name}!</h2>
          <p>Your SportRise athlete profile has been verified successfully for <strong>${sport}</strong>.</p>
          <div class="id-badge">
            <span style="font-size: 12px; color: #38bdf8; text-transform: uppercase; font-weight: 600;">Unique SportRise Athlete ID</span><br/>
            <strong style="font-size: 24px; color: #f8fafc; letter-spacing: 2px;">${athleteId}</strong>
          </div>
          <p>You can now log in using either your email or this Athlete ID to log performance drills, calculate your AI Skill Index, and climb state & national leaderboards.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    console.log(`\n🎉 [SPORTRISE ATHLETE CONFIRMED]: ${name} (${athleteId}) - ${sport}\n`);

    if (!this.transporter) return;
    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html: htmlContent,
      });
    } catch {
      // Ignored in dev
    }
  }
}

export const mailService = new MailService();
export default mailService;
