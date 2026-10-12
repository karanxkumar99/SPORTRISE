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
          message: "Please enter a valid 10-digit Indian mobile number (e.g., +91 XXXXXXXXXX or XXXXXXXXXX).",
        });
      }

      // Email format
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await UserModel.findByEmail(normalizedEmail);
      if (existingUser) {
        if (!existingUser.isVerified) {
          try {
            // Send fresh OTP for pending verification
            const { plainOtp } = await OTPModel.createOtp({
              email: normalizedEmail,
              userId: existingUser.id,
              userType: "ATHLETE",
            });

            await mailService.sendOtpEmail({
              to: normalizedEmail,
              name: existingUser.fullName,
              otp: plainOtp,
              type: "ATHLETE",
            });

            return res.status(200).json({
              success: true,
              isExistingUnverified: true,
              athleteId: existingUser.athleteId,
              email: normalizedEmail,
              message: "An unverified account exists. A fresh 6-digit verification code has been dispatched to your email address.",
            });
          } catch (cooldownErr: any) {
            return res.status(429).json({
              success: false,
              message: cooldownErr.message,
            });
          }
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
      const { plainOtp } = await OTPModel.createOtp({
        email: normalizedEmail,
        userId: newUser.id,
        userType: "ATHLETE",
      });

      // Dispatch branded email
      await mailService.sendOtpEmail({
        to: normalizedEmail,
        name: newUser.fullName,
        otp: plainOtp,
        type: "ATHLETE",
      });

      // Recalculate sport rankings
      await aiRankingService.recalculateSportRankings(newUser.sport);

      return res.status(201).json({
        success: true,
        message: "Registration initiated! We sent a 6-digit verification code to your email address.",
        athleteId: newUser.athleteId,
        email: newUser.email,
      });
    } catch (err: any) {
      console.error("Register Error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Registration failed due to server error. Please try again.",
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

      const verifyResult = await OTPModel.verifyOtp(normalizedEmail, otp.trim(), "ATHLETE");

      if (!verifyResult.success) {
        return res.status(400).json({
          success: false,
          message: verifyResult.message,
        });
      }

      // Mark athlete as verified and record verification timestamp
      const verifiedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      // Send Welcome confirmation email
      await mailService.sendWelcomeEmail({
        to: verifiedUser.email,
        name: verifiedUser.fullName,
        athleteId: verifiedUser.athleteId,
        sport: verifiedUser.sport,
        type: "ATHLETE",
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
          verifiedPerformanceScore: verifiedUser.verifiedPerformanceScore,
          isProvisional: verifiedUser.isProvisional,
          isVerified: verifiedUser.isVerified,
          avatarUrl: verifiedUser.avatarUrl,
          position: verifiedUser.position,
          experienceYears: verifiedUser.experienceYears,
          achievements: verifiedUser.achievements,
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
   * Resend OTP Flow with Cooldown
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

      try {
        const { plainOtp } = await OTPModel.createOtp({
          email: normalizedEmail,
          userId: user.id,
          userType: "ATHLETE",
        });

        await mailService.sendOtpEmail({
          to: normalizedEmail,
          name: user.fullName,
          otp: plainOtp,
          type: "ATHLETE",
        });

        return res.status(200).json({
          success: true,
          message: "A new 6-digit verification code has been dispatched to your email address.",
        });
      } catch (cooldownErr: any) {
        return res.status(429).json({
          success: false,
          message: cooldownErr.message,
        });
      }
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
        try {
          // Send fresh OTP so user can finish verification
          const { plainOtp } = await OTPModel.createOtp({
            email: user.email,
            userId: user.id,
            userType: "ATHLETE",
          });

          await mailService.sendOtpEmail({
            to: user.email,
            name: user.fullName,
            otp: plainOtp,
            type: "ATHLETE",
          });
        } catch {
          // Cooldown active, existing OTP is still within 60s window
        }

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
          verifiedPerformanceScore: user.verifiedPerformanceScore,
          isProvisional: user.isProvisional,
          verifiedMatchesCount: user.verifiedMatchesCount,
          nationalRank: user.nationalRank,
          stateRank: user.stateRank,
          districtRank: user.districtRank,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          position: user.position,
          experienceYears: user.experienceYears,
          achievements: user.achievements,
          isVerified: user.isVerified,
        },
      });
    } catch (err) {
      console.error("Login Error:", err);
      return res.status(500).json({ success: false, message: "Login failed due to server error." });
    }
  },

  /**
   * Get Logged-in Athlete Profile & Rankings & Verified Match History
   */
  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }

      const athlete = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          matchParticipations: {
            include: {
              match: {
                include: {
                  institution: {
                    select: { name: true, city: true, state: true },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 15,
          },
          rankingHistories: {
            orderBy: { calculatedAt: "desc" },
            take: 10,
          },
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
          verifiedPerformanceScore: athlete.verifiedPerformanceScore,
          isProvisional: athlete.isProvisional,
          verifiedMatchesCount: athlete.verifiedMatchesCount,
          nationalRank: athlete.nationalRank || 1,
          stateRank: athlete.stateRank || 1,
          districtRank: athlete.districtRank || 1,
          bio: athlete.bio,
          avatarUrl: athlete.avatarUrl,
          position: athlete.position,
          experienceYears: athlete.experienceYears,
          achievements: athlete.achievements ? JSON.parse(athlete.achievements || "[]") : [],
          lastAiReport: athlete.lastAiReport ? JSON.parse(athlete.lastAiReport || "{}") : null,
          isVerified: athlete.isVerified,
          emailVerifiedAt: athlete.emailVerifiedAt,
          createdAt: athlete.createdAt,
        },
        stats: {
          totalNationalInSport,
          totalStateInSport,
          totalDistrictInSport,
        },
        verifiedMatches: athlete.matchParticipations.map((p) => ({
          id: p.id,
          matchId: p.matchId,
          matchNumber: p.match.matchNumber,
          competitionName: p.match.competitionName,
          sport: p.match.sport,
          matchDate: p.match.matchDate,
          venue: p.match.venue,
          finalScore: p.match.finalScore,
          winner: p.match.winner,
          status: p.match.status,
          role: p.role,
          teamName: p.teamName,
          individualStats: JSON.parse(p.individualStats || "{}"),
          performanceRating: p.performanceRating,
          institutionName: p.match.institution.name,
        })),
        rankingHistory: athlete.rankingHistories,
      });
    } catch (err) {
      console.error("Get Profile Error:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch profile." });
    }
  },

  /**
   * Update Athlete Profile (Protected)
   */
  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }

      const { fullName, bio, avatarUrl, position, dob, experienceYears, achievements, mobile, state, district } = req.body;

      // Safe update data — forbidden to tamper with roles, verification, athleteId, or official ranks
      const updateData: any = {};

      if (fullName && typeof fullName === "string") updateData.fullName = fullName.trim();
      if (bio !== undefined) updateData.bio = bio;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
      if (position !== undefined) updateData.position = position;
      if (dob) updateData.dob = new Date(dob);
      if (experienceYears !== undefined) updateData.experienceYears = parseInt(experienceYears, 10) || 0;
      if (achievements !== undefined) {
        updateData.achievements = typeof achievements === "string" ? achievements : JSON.stringify(achievements);
      }
      if (mobile && MOBILE_REGEX.test(mobile.replace(/[\s-]/g, ""))) {
        updateData.mobile = mobile.replace(/[\s-]/g, "");
      }
      if (state) updateData.state = state;
      if (district) updateData.district = district;

      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
      });

      return res.status(200).json({
        success: true,
        message: "Athlete profile updated successfully!",
        user: {
          id: updated.id,
          athleteId: updated.athleteId,
          fullName: updated.fullName,
          email: updated.email,
          mobile: updated.mobile,
          state: updated.state,
          district: updated.district,
          sport: updated.sport,
          ageCategory: updated.ageCategory,
          gender: updated.gender,
          bio: updated.bio,
          avatarUrl: updated.avatarUrl,
          position: updated.position,
          experienceYears: updated.experienceYears,
          achievements: updated.achievements ? JSON.parse(updated.achievements || "[]") : [],
          isVerified: updated.isVerified,
        },
      });
    } catch (err: any) {
      console.error("Update Profile Error:", err);
      return res.status(500).json({ success: false, message: err.message || "Failed to update profile." });
    }
  },
};

export default AuthController;
