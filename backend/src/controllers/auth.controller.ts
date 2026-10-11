import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import UserModel from "../models/User";
import OTPModel from "../models/OTP";
import mailService from "../services/mail.service";
import aiRankingService from "../services/aiRanking.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

// Password regex: min 8 chars, 1 uppercase, 1 special char
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
// Indian mobile: 10 digits, optional +91 prefix
const MOBILE_REGEX = /^(\+91[\-\s]?)?[6-9]\d{9}$/;

export const AuthController = {
  /**
   * Athlete Registration Flow
   */
  async register(req: Request, res: Response) {
    try {
      const {
        fullName,
        mobile,
        email,
        password,
        confirmPassword,
        state,
        district,
        sport,
        ageCategory = "U-19",
        gender = "Male",
      } = req.body;

      if (!fullName || !mobile || !email || !password || !state || !district || !sport) {
        return res.status(400).json({
          success: false,
          message: "Please fill in all required registration fields.",
        });
      }

      // Confirm password match
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Passwords do not match.",
        });
      }

      // Password complexity
      if (!PASSWORD_REGEX.test(password)) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long, include at least 1 uppercase letter and 1 special character.",
        });
      }

      // Indian mobile check
      const cleanedMobile = mobile.replace(/[\s-]/g, "");
      if (!MOBILE_REGEX.test(cleanedMobile)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid 10-digit Indian mobile number (e.g., +91 9876543210 or 9876543210).",
        });
      }

      // Email format
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await UserModel.findByEmail(normalizedEmail);
      if (existingUser) {
        if (!existingUser.isVerified) {
          // Send fresh OTP for pending verification
          const otpRecord = await OTPModel.createOtp(normalizedEmail, existingUser.id);
          await mailService.sendOtpEmail({
            to: normalizedEmail,
            name: existingUser.fullName,
            otp: otpRecord.otp,
          });

          return res.status(200).json({
            success: true,
            isExistingUnverified: true,
            athleteId: existingUser.athleteId,
            email: normalizedEmail,
            message: "An unverified account exists. A fresh 6-digit verification code has been dispatched to your email address.",
          });
        }

        return res.status(409).json({
          success: false,
          message: "An athlete with this email address is already registered. Please log in.",
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create athlete record
      const newUser = await UserModel.create({
        fullName: fullName.trim(),
        mobile: cleanedMobile,
        email: normalizedEmail,
        password: hashedPassword,
        state,
        district,
        sport,
        ageCategory,
        gender,
      });

      // Generate 6-digit OTP
      const otpRecord = await OTPModel.createOtp(normalizedEmail, newUser.id);

      // Dispatch branded email
      await mailService.sendOtpEmail({
        to: normalizedEmail,
        name: newUser.fullName,
        otp: otpRecord.otp,
      });

      // Recalculate sport rankings
      await aiRankingService.recalculateSportRankings(newUser.sport);

      return res.status(201).json({
        success: true,
        message: "Registration initiated! We sent a 6-digit verification code to your email address.",
        athleteId: newUser.athleteId,
        email: newUser.email,
      });
    } catch (err) {
      console.error("Register Error:", err);
      return res.status(500).json({
        success: false,
        message: "Registration failed due to server error. Please try again.",
      });
    }
  },

  /**
   * OTP Verification Flow
   */
  async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: "Email and 6-digit OTP code are required.",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = await UserModel.findByEmail(normalizedEmail);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "No athlete account found with this email.",
        });
      }

      const validOtp = await OTPModel.verifyOtp(normalizedEmail, otp.trim());

      if (!validOtp) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP. Please request a new code.",
        });
      }

      // Mark athlete as verified
      const verifiedUser = await UserModel.markVerified(user.id);

      // Send Welcome confirmation email
      await mailService.sendWelcomeEmail({
        to: verifiedUser.email,
        name: verifiedUser.fullName,
        athleteId: verifiedUser.athleteId,
        sport: verifiedUser.sport,
      });

      // Recalculate sport rankings
      await aiRankingService.recalculateSportRankings(verifiedUser.sport);

      // Issue JWT Token
      const secret = process.env.JWT_SECRET || "sportrise_grassroots_sports_secret_token_key_2026";
      const token = jwt.sign(
        { id: verifiedUser.id, email: verifiedUser.email, athleteId: verifiedUser.athleteId },
        secret,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        success: true,
        message: "Athlete identity successfully verified! Welcome to SportRise.",
        token,
        user: {
          id: verifiedUser.id,
          athleteId: verifiedUser.athleteId,
          fullName: verifiedUser.fullName,
          email: verifiedUser.email,
          mobile: verifiedUser.mobile,
          state: verifiedUser.state,
          district: verifiedUser.district,
          sport: verifiedUser.sport,
          ageCategory: verifiedUser.ageCategory,
          gender: verifiedUser.gender,
          skillIndex: verifiedUser.skillIndex,
          isVerified: verifiedUser.isVerified,
        },
      });
    } catch (err) {
      console.error("Verify OTP Error:", err);
      return res.status(500).json({
        success: false,
        message: "Verification failed due to server error.",
      });
    }
  },

  /**
   * Resend OTP Flow
   */
  async resendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required." });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = await UserModel.findByEmail(normalizedEmail);

      if (!user) {
        return res.status(404).json({ success: false, message: "No athlete account found." });
      }

      const otpRecord = await OTPModel.createOtp(normalizedEmail, user.id);
      await mailService.sendOtpEmail({
        to: normalizedEmail,
        name: user.fullName,
        otp: otpRecord.otp,
      });

      return res.status(200).json({
        success: true,
        message: "A new 6-digit verification code has been dispatched to your email address.",
      });
    } catch (err) {
      console.error("Resend OTP Error:", err);
      return res.status(500).json({ success: false, message: "Failed to resend code." });
    }
  },

  /**
   * Login with Email OR Athlete ID + Password
   */
  async login(req: Request, res: Response) {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide your Email or SportRise Athlete ID and password.",
        });
      }

      const trimmedIdentifier = identifier.trim();

      // Look up by athleteId or email
      let user = null;
      if (trimmedIdentifier.toUpperCase().startsWith("SR-IND-")) {
        user = await UserModel.findByAthleteId(trimmedIdentifier);
      } else {
        user = await UserModel.findByEmail(trimmedIdentifier);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "No registered athlete found with these credentials.",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Incorrect password. Please verify and try again.",
        });
      }

      if (!user.isVerified) {
        // Send OTP so user can finish verification
        const otpRecord = await OTPModel.createOtp(user.email, user.id);
        await mailService.sendOtpEmail({
          to: user.email,
          name: user.fullName,
          otp: otpRecord.otp,
        });

        return res.status(403).json({
          success: false,
          requiresVerification: true,
          email: user.email,
          athleteId: user.athleteId,
          message: "Your profile is pending email verification. A fresh verification code has been sent to your email address.",
        });
      }

      // Generate JWT Token
      const secret = process.env.JWT_SECRET || "sportrise_grassroots_sports_secret_token_key_2026";
      const token = jwt.sign(
        { id: user.id, email: user.email, athleteId: user.athleteId },
        secret,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        success: true,
        message: "Athlete login successful!",
        token,
        user: {
          id: user.id,
          athleteId: user.athleteId,
          fullName: user.fullName,
          email: user.email,
          mobile: user.mobile,
          state: user.state,
          district: user.district,
          sport: user.sport,
          ageCategory: user.ageCategory,
          gender: user.gender,
          skillIndex: user.skillIndex,
          nationalRank: user.nationalRank,
          stateRank: user.stateRank,
          districtRank: user.districtRank,
          bio: user.bio,
          isVerified: user.isVerified,
        },
      });
    } catch (err) {
      console.error("Login Error:", err);
      return res.status(500).json({ success: false, message: "Login failed due to server error." });
    }
  },

  /**
   * Get Logged-in Athlete Profile & Rankings
   */
  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }

      const athlete = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          performanceRecords: {
            orderBy: { recordedAt: "desc" },
            take: 10,
          },
        },
      });

      if (!athlete) {
        return res.status(404).json({ success: false, message: "Athlete not found." });
      }

      // Compute rank summary
      const totalNationalInSport = await prisma.user.count({ where: { sport: athlete.sport } });
      const totalStateInSport = await prisma.user.count({ where: { sport: athlete.sport, state: athlete.state } });
      const totalDistrictInSport = await prisma.user.count({
        where: { sport: athlete.sport, state: athlete.state, district: athlete.district },
      });

      // Parse records safely
      const parsedRecords = athlete.performanceRecords.map((r) => ({
        ...r,
        metrics: JSON.parse(r.metrics || "{}"),
        aiStrengths: JSON.parse(r.aiStrengths || "[]"),
        aiImprovements: JSON.parse(r.aiImprovements || "[]"),
        aiRecommendations: JSON.parse(r.aiRecommendations || "[]"),
      }));

      return res.status(200).json({
        success: true,
        user: {
          id: athlete.id,
          athleteId: athlete.athleteId,
          fullName: athlete.fullName,
          email: athlete.email,
          mobile: athlete.mobile,
          state: athlete.state,
          district: athlete.district,
          sport: athlete.sport,
          ageCategory: athlete.ageCategory,
          gender: athlete.gender,
          skillIndex: athlete.skillIndex,
          nationalRank: athlete.nationalRank || 1,
          stateRank: athlete.stateRank || 1,
          districtRank: athlete.districtRank || 1,
          bio: athlete.bio,
          isVerified: athlete.isVerified,
          createdAt: athlete.createdAt,
        },
        stats: {
          totalNationalInSport,
          totalStateInSport,
          totalDistrictInSport,
        },
        performanceHistory: parsedRecords,
      });
    } catch (err) {
      console.error("Get Profile Error:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch profile." });
    }
  },
};

export default AuthController;
