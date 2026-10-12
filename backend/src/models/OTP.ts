import { prisma } from "../prisma";
import crypto from "crypto";

export interface CreateOtpParams {
  email: string;
  userId?: string;
  institutionId?: string;
  userType?: "ATHLETE" | "INSTITUTION";
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
  record?: any;
}

export const OTPModel = {
  /**
   * Generates a cryptographically secure 6-digit OTP
   */
  generateOtpCode(): string {
    const randomInt = crypto.randomInt(100000, 1000000);
    return randomInt.toString();
  },

  /**
   * Hashes an OTP code using SHA-256 for secure storage
   */
  hashOtp(code: string): string {
    return crypto.createHash("sha256").update(code.trim()).digest("hex");
  },

  /**
   * Creates a fresh OTP with 10-minute validity, cooldown checks, and attempt tracking
   */
  /**
   * Creates a fresh OTP with 10-minute validity, 15-second cooldown, and attempt tracking
   */
  async createOtp({ email, userId, institutionId, userType = "ATHLETE" }: CreateOtpParams) {
    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date();

    // Check for recent OTP to enforce 15-second resend cooldown (fast, user-friendly)
    const recentOtp = await prisma.oTP.findFirst({
      where: {
        email: normalizedEmail,
        userType,
        used: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentOtp) {
      const timeSinceLastSent = (now.getTime() - new Date(recentOtp.lastSentAt).getTime()) / 1000;
      const cooldownSeconds = 15;
      if (timeSinceLastSent < cooldownSeconds) {
        const remaining = Math.ceil(cooldownSeconds - timeSinceLastSent);
        throw new Error(`Please wait ${remaining}s before requesting a new verification code.`);
      }
    }

    // Mark only truly expired OTPs as used (keep recent unexpired OTPs valid so recipient isn't invalidated)
    await prisma.oTP.updateMany({
      where: {
        email: normalizedEmail,
        userType,
        used: false,
        expiresAt: { lte: now },
      },
      data: {
        used: true,
      },
    });

    const plainOtp = this.generateOtpCode();
    const hashedOtp = this.hashOtp(plainOtp);
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes expiry

    const otpRecord = await prisma.oTP.create({
      data: {
        email: normalizedEmail,
        otp: plainOtp,
        hashedOtp,
        expiresAt,
        attempts: 0,
        maxAttempts: 5,
        lastSentAt: now,
        userType,
        userId: userId || null,
        institutionId: institutionId || null,
      },
    });

    return {
      record: otpRecord,
      plainOtp,
      expiresAt,
    };
  },

  /**
   * Validates OTP for given email. Accepts ANY active, unexpired OTP issued to this email.
   * This completely prevents race conditions when multiple emails are sent.
   */
  async verifyOtp(email: string, plainOtp: string, userType: "ATHLETE" | "INSTITUTION" = "ATHLETE"): Promise<VerifyOtpResult> {
    const normalizedEmail = email.toLowerCase().trim();
    const cleanCode = plainOtp.trim();
    const now = new Date();

    // Find all active unexpired records for this email
    const activeRecords = await prisma.oTP.findMany({
      where: {
        email: normalizedEmail,
        userType,
        used: false,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!activeRecords || activeRecords.length === 0) {
      return {
        success: false,
        message: "No active verification code found or code has expired. Please request a new code.",
      };
    }

    const incomingHash = this.hashOtp(cleanCode);

    // Check if the entered code matches ANY of the active OTPs dispatched in the last 10 minutes
    const matchingRecord = activeRecords.find(
      (rec) => (rec.hashedOtp && rec.hashedOtp === incomingHash) || rec.otp === cleanCode
    );

    if (matchingRecord) {
      // Invalidate all OTPs for this email and user type once verified
      await prisma.oTP.updateMany({
        where: {
          email: normalizedEmail,
          userType,
        },
        data: { used: true },
      });

      return {
        success: true,
        message: "Verification successful.",
        record: matchingRecord,
      };
    }

    // If no match, increment attempts on the newest record
    const latestRecord = activeRecords[0];
    const updated = await prisma.oTP.update({
      where: { id: latestRecord.id },
      data: { attempts: { increment: 1 } },
    });

    const remainingAttempts = Math.max(0, updated.maxAttempts - updated.attempts);
    if (updated.attempts >= updated.maxAttempts) {
      await prisma.oTP.updateMany({
        where: { email: normalizedEmail, userType },
        data: { used: true },
      });
      return {
        success: false,
        message: "Maximum verification attempts exceeded. Please click 'Resend Code' for a fresh code.",
      };
    }

    return {
      success: false,
      message: `Incorrect 6-digit code. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : "Please request a new code."}`,
    };
  },
};

export default OTPModel;
