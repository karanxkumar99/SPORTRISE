import { prisma } from "../prisma";
import crypto from "crypto";

export const OTPModel = {
  /**
   * Generates a cryptographically secure 6-digit OTP
   */
  generateOtpCode(): string {
    const randomInt = crypto.randomInt(100000, 1000000);
    return randomInt.toString();
  },

  /**
   * Creates a new OTP record valid for 10 minutes
   */
  async createOtp(email: string, userId?: string) {
    const otpCode = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Invalidate prior unused OTPs for this email
    await prisma.oTP.updateMany({
      where: {
        email: email.toLowerCase(),
        used: false,
      },
      data: {
        used: true,
      },
    });

    const otpRecord = await prisma.oTP.create({
      data: {
        email: email.toLowerCase(),
        otp: otpCode,
        expiresAt,
        userId,
      },
    });

    return otpRecord;
  },

  /**
   * Validates OTP for given email
   */
  async verifyOtp(email: string, otpCode: string) {
    const record = await prisma.oTP.findFirst({
      where: {
        email: email.toLowerCase(),
        otp: otpCode.trim(),
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!record) {
      return null;
    }

    // Mark as used
    await prisma.oTP.update({
      where: { id: record.id },
      data: { used: true },
    });

    return record;
  },
};

export default OTPModel;
