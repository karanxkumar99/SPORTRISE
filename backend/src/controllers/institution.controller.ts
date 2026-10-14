import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import OTPModel from "../models/OTP";
import mailService from "../services/mail.service";
import { AuthenticatedInstitutionRequest } from "../middleware/institutionAuth.middleware";

export const InstitutionController = {
  /**
   * Institution Registration Flow with Real Email Verification
   */
  async register(req: Request, res: Response) {
    try {
      const {
        name,
        type,
        logo,
        email,
        password,
        contactNumber,
        website,
        address,
        city,
        state,
        country = "India",
        pincode,
        authorizedPersonName,
        authorizedPersonContact,
        description,
        coordinatorName,
        coordinatorEmail,
        coordinatorPhone,
        latitude,
        longitude,
        supportedSports,
        facilities,
        coaches,
      } = req.body;

      // Validation
      if (!name || !type || !email || !password || !contactNumber || !address || !city || !state || !pincode) {
        return res.status(400).json({
          success: false,
          message: "Please fill in all mandatory institution registration fields.",
        });
      }

      if (!coordinatorName || !coordinatorEmail || !coordinatorPhone) {
        return res.status(400).json({
          success: false,
          message: "Event coordinator details (Name, Email, Phone) are required.",
        });
      }

      // Indian mobile validation for contactNumber
      const rawContact = String(contactNumber || "").trim();
      if (/[a-zA-Z]/.test(rawContact)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid 10-digit mobile number. Letters are not allowed.",
        });
      }
      if (/[^0-9]/.test(rawContact)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid 10-digit mobile number. Special characters are not allowed.",
        });
      }
      if (rawContact.length < 10) {
        return res.status(400).json({
          success: false,
          message: "Mobile number must contain exactly 10 digits.",
        });
      }
      if (rawContact.length > 10) {
        return res.status(400).json({
          success: false,
          message: "Mobile number cannot contain more than 10 digits.",
        });
      }
      if (!/^[6-9]\d{9}$/.test(rawContact)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid Indian mobile number starting with 6, 7, 8, or 9.",
        });
      }

      // Indian mobile validation for coordinatorPhone
      const rawCoordPhone = String(coordinatorPhone || "").trim();
      if (/[a-zA-Z]/.test(rawCoordPhone)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid 10-digit mobile number for coordinator. Letters are not allowed.",
        });
      }
      if (rawCoordPhone.length < 10) {
        return res.status(400).json({
          success: false,
          message: "Coordinator mobile number must contain exactly 10 digits.",
        });
      }
      if (rawCoordPhone.length > 10) {
        return res.status(400).json({
          success: false,
          message: "Coordinator mobile number cannot contain more than 10 digits.",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existing = await prisma.institution.findUnique({
        where: { email: normalizedEmail },
      });

      if (existing) {
        if (!existing.isVerified) {
          try {
            // Unverified institution exists: generate fresh OTP
            const { plainOtp } = await OTPModel.createOtp({
              email: normalizedEmail,
              institutionId: existing.id,
              userType: "INSTITUTION",
            });

            await mailService.sendOtpEmail({
              to: normalizedEmail,
              name: existing.name,
              otp: plainOtp,
              type: "INSTITUTION",
            });

            return res.status(200).json({
              success: true,
              isExistingUnverified: true,
              email: normalizedEmail,
              institutionName: existing.name,
              message: "An unverified institution account exists. A fresh 6-digit verification code has been dispatched to your email address.",
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
          message: "An institution with this email is already registered. Please log in.",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const institution = await prisma.institution.create({
        data: {
          name: name.trim(),
          type,
          logo: logo || null,
          email: normalizedEmail,
          password: hashedPassword,
          contactNumber: contactNumber.trim(),
          website: website?.trim() || null,
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          pincode: pincode.trim(),
          authorizedPersonName: authorizedPersonName?.trim() || name.trim(),
          authorizedPersonContact: authorizedPersonContact?.trim() || contactNumber.trim(),
          description: description?.trim() || null,
          coordinatorName: coordinatorName.trim(),
          coordinatorEmail: coordinatorEmail.trim().toLowerCase(),
          coordinatorPhone: coordinatorPhone.trim(),
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          isVerified: false, // Must be verified via real OTP email
          supportedSports: supportedSports ? (typeof supportedSports === "string" ? supportedSports : JSON.stringify(supportedSports)) : null,
          facilities: facilities ? (typeof facilities === "string" ? facilities : JSON.stringify(facilities)) : null,
          coaches: coaches ? (typeof coaches === "string" ? coaches : JSON.stringify(coaches)) : null,
        },
      });

      // Generate secure 6-digit OTP
      const { plainOtp } = await OTPModel.createOtp({
        email: normalizedEmail,
        institutionId: institution.id,
        userType: "INSTITUTION",
      });

      // Dispatch real email OTP
      await mailService.sendOtpEmail({
        to: normalizedEmail,
        name: institution.name,
        otp: plainOtp,
        type: "INSTITUTION",
      });

      return res.status(201).json({
        success: true,
        message: "Institution registered! We sent a 6-digit verification code to your email address.",
        email: institution.email,
        institutionId: institution.id,
        requiresVerification: true,
      });
    } catch (err: any) {
      console.error("Institution Register Error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to register institution. Please check your data.",
      });
    }
  },

  /**
   * Institution OTP Verification
   */
  async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: "Institution email and 6-digit OTP code are required.",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const institution = await prisma.institution.findUnique({
        where: { email: normalizedEmail },
      });

      if (!institution) {
        return res.status(404).json({
          success: false,
          message: "No institution account found with this email.",
        });
      }

      const verifyResult = await OTPModel.verifyOtp(normalizedEmail, otp.trim(), "INSTITUTION");

      if (!verifyResult.success) {
        return res.status(400).json({
          success: false,
          message: verifyResult.message,
        });
      }

      // Mark institution as verified with timestamp
      const verifiedInst = await prisma.institution.update({
        where: { id: institution.id },
        data: {
          isVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      // Create welcome notification
      await prisma.notification.create({
        data: {
          institutionId: verifiedInst.id,
          title: "Welcome to SportRise Event Portal",
          message: `Your institution profile for ${verifiedInst.name} has been verified successfully. You can now publish sports tournaments and submit official match scorecards.`,
          type: "success",
        },
      });

      // Send Welcome confirmation email
      await mailService.sendWelcomeEmail({
        to: verifiedInst.email,
        name: verifiedInst.name,
        type: "INSTITUTION",
      });

      // Issue JWT Token
      const secret = process.env.JWT_SECRET || "sportrise_grassroots_sports_secret_token_key_2026";
      const token = jwt.sign(
        { id: verifiedInst.id, email: verifiedInst.email, role: "institution" },
        secret,
        { expiresIn: "7d" }
      );

      const { password, ...safeData } = verifiedInst;

      return res.status(200).json({
        success: true,
        message: "Institution email verified successfully! Welcome to SportRise.",
        token,
        institution: safeData,
      });
    } catch (err: any) {
      console.error("Institution Verify OTP Error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Verification failed due to server error.",
      });
    }
  },

  /**
   * Resend Institution OTP Flow with Cooldown
   */
  async resendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "Institution email is required." });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const institution = await prisma.institution.findUnique({
        where: { email: normalizedEmail },
      });

      if (!institution) {
        return res.status(404).json({ success: false, message: "No institution account found." });
      }

      try {
        const { plainOtp } = await OTPModel.createOtp({
          email: normalizedEmail,
          institutionId: institution.id,
          userType: "INSTITUTION",
        });

        await mailService.sendOtpEmail({
          to: normalizedEmail,
          name: institution.name,
          otp: plainOtp,
          type: "INSTITUTION",
        });

        return res.status(200).json({
          success: true,
          message: "A new 6-digit verification code has been dispatched to your institution email.",
        });
      } catch (cooldownErr: any) {
        return res.status(429).json({
          success: false,
          message: cooldownErr.message,
        });
      }
    } catch (err: any) {
      console.error("Institution Resend OTP Error:", err);
      return res.status(500).json({ success: false, message: "Failed to resend code." });
    }
  },

  /**
   * Institution Login
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please enter your institution email and password.",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const institution = await prisma.institution.findUnique({
        where: { email: normalizedEmail },
      });

      if (!institution) {
        return res.status(401).json({
          success: false,
          message: "No institution account found with this email.",
        });
      }

      const isMatch = await bcrypt.compare(password, institution.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials. Please verify your password.",
        });
      }

      // Check verification status
      if (!institution.isVerified) {
        try {
          const { plainOtp } = await OTPModel.createOtp({
            email: institution.email,
            institutionId: institution.id,
            userType: "INSTITUTION",
          });

          await mailService.sendOtpEmail({
            to: institution.email,
            name: institution.name,
            otp: plainOtp,
            type: "INSTITUTION",
          });
        } catch {
          // Cooldown active, existing code is valid
        }

        return res.status(403).json({
          success: false,
          requiresVerification: true,
          email: institution.email,
          institutionName: institution.name,
          message: "Your institution account requires email verification. A fresh 6-digit verification code has been sent to your email address.",
        });
      }

      const secret = process.env.JWT_SECRET || "sportrise_grassroots_sports_secret_token_key_2026";
      const token = jwt.sign(
        { id: institution.id, email: institution.email, role: "institution" },
        secret,
        { expiresIn: "7d" }
      );

      const { password: pwd, ...safeData } = institution;

      return res.status(200).json({
        success: true,
        message: "Institution sign-in successful!",
        token,
        institution: safeData,
      });
    } catch (err) {
      console.error("Institution Login Error:", err);
      return res.status(500).json({
        success: false,
        message: "Sign in failed due to server error.",
      });
    }
  },

  /**
   * Get Current Institution Profile
   */
  async getProfile(req: AuthenticatedInstitutionRequest, res: Response) {
    try {
      if (!req.institution) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }

      const inst = await prisma.institution.findUnique({
        where: { id: req.institution.id },
      });

      if (!inst) {
        return res.status(404).json({ success: false, message: "Institution not found." });
      }

      const { password, ...safeData } = inst;
      return res.status(200).json({
        success: true,
        institution: {
          ...safeData,
          supportedSports: safeData.supportedSports ? JSON.parse(safeData.supportedSports || "[]") : [],
          facilities: safeData.facilities ? JSON.parse(safeData.facilities || "{}") : {},
          coaches: safeData.coaches ? JSON.parse(safeData.coaches || "[]") : [],
          documents: safeData.documents ? JSON.parse(safeData.documents || "[]") : [],
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Failed to fetch profile." });
    }
  },

  /**
   * Update Institution Profile (Protected)
   */
  async updateProfile(req: AuthenticatedInstitutionRequest, res: Response) {
    try {
      if (!req.institution) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }

      const {
        name,
        type,
        logo,
        contactNumber,
        website,
        address,
        city,
        state,
        pincode,
        authorizedPersonName,
        authorizedPersonContact,
        description,
        coordinatorName,
        coordinatorEmail,
        coordinatorPhone,
        latitude,
        longitude,
        supportedSports,
        facilities,
        coaches,
        documents,
      } = req.body;

      // Safe update data — forbidden to tamper with id, email, password, isVerified, emailVerifiedAt
      const updateData: any = {};

      if (name) updateData.name = name.trim();
      if (type) updateData.type = type;
      if (logo !== undefined) updateData.logo = logo;
      if (contactNumber) updateData.contactNumber = contactNumber.trim();
      if (website !== undefined) updateData.website = website?.trim() || null;
      if (address) updateData.address = address.trim();
      if (city) updateData.city = city.trim();
      if (state) updateData.state = state.trim();
      if (pincode) updateData.pincode = pincode.trim();
      if (authorizedPersonName) updateData.authorizedPersonName = authorizedPersonName.trim();
      if (authorizedPersonContact) updateData.authorizedPersonContact = authorizedPersonContact.trim();
      if (description !== undefined) updateData.description = description?.trim() || null;
      if (coordinatorName) updateData.coordinatorName = coordinatorName.trim();
      if (coordinatorEmail) updateData.coordinatorEmail = coordinatorEmail.trim().toLowerCase();
      if (coordinatorPhone) updateData.coordinatorPhone = coordinatorPhone.trim();

      if (latitude !== undefined) {
        updateData.latitude = latitude ? parseFloat(latitude) : null;
      }
      if (longitude !== undefined) {
        updateData.longitude = longitude ? parseFloat(longitude) : null;
      }

      if (supportedSports !== undefined) {
        updateData.supportedSports = typeof supportedSports === "string" ? supportedSports : JSON.stringify(supportedSports);
      }
      if (facilities !== undefined) {
        updateData.facilities = typeof facilities === "string" ? facilities : JSON.stringify(facilities);
      }
      if (coaches !== undefined) {
        updateData.coaches = typeof coaches === "string" ? coaches : JSON.stringify(coaches);
      }
      if (documents !== undefined) {
        updateData.documents = typeof documents === "string" ? documents : JSON.stringify(documents);
      }

      const updated = await prisma.institution.update({
        where: { id: req.institution.id },
        data: updateData,
      });

      const { password, ...safeData } = updated;
      return res.status(200).json({
        success: true,
        message: "Institution profile updated successfully!",
        institution: {
          ...safeData,
          supportedSports: safeData.supportedSports ? JSON.parse(safeData.supportedSports || "[]") : [],
          facilities: safeData.facilities ? JSON.parse(safeData.facilities || "{}") : {},
          coaches: safeData.coaches ? JSON.parse(safeData.coaches || "[]") : [],
          documents: safeData.documents ? JSON.parse(safeData.documents || "[]") : [],
        },
      });
    } catch (err: any) {
      console.error("Update Institution Profile Error:", err);
      return res.status(500).json({ success: false, message: err.message || "Failed to update profile." });
    }
  },

  /**
   * Institution Dashboard Analytics & Summary
   */
  async getStats(req: AuthenticatedInstitutionRequest, res: Response) {
    try {
      if (!req.institution) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }

      const institutionId = req.institution.id;
      const now = new Date();

      const [
        totalEvents,
        upcomingEvents,
        ongoingEvents,
        completedEvents,
        draftEvents,
        totalRegistrations,
        pendingApplications,
        recentApplications,
        recentEvents,
        totalMatches,
        verifiedMatches,
        pendingMatches,
      ] = await Promise.all([
        prisma.event.count({ where: { institutionId } }),
        prisma.event.count({
          where: { institutionId, status: "Published", startDate: { gt: now } },
        }),
        prisma.event.count({
          where: { institutionId, status: "Published", startDate: { lte: now }, endDate: { gte: now } },
        }),
        prisma.event.count({
          where: { institutionId, status: "Published", endDate: { lt: now } },
        }),
        prisma.event.count({ where: { institutionId, status: "Draft" } }),
        prisma.application.count({
          where: { event: { institutionId } },
        }),
        prisma.application.count({
          where: {
            event: { institutionId },
            status: { in: ["Submitted", "Under Review"] },
          },
        }),
        prisma.application.findMany({
          where: { event: { institutionId } },
          orderBy: { createdAt: "desc" },
          take: 6,
          include: {
            event: {
              select: { name: true, sportGame: true, category: true },
            },
          },
        }),
        prisma.event.findMany({
          where: { institutionId },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            _count: {
              select: { applications: true },
            },
          },
        }),
        prisma.match.count({ where: { instituteId: institutionId } }),
        prisma.match.count({ where: { instituteId: institutionId, status: "VERIFIED" } }),
        prisma.match.count({
          where: { instituteId: institutionId, status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
        }),
      ]);

      return res.status(200).json({
        success: true,
        stats: {
          totalEvents,
          upcomingEvents,
          ongoingEvents,
          completedEvents,
          draftEvents,
          totalRegistrations,
          pendingApplications,
          totalMatches,
          verifiedMatches,
          pendingMatches,
        },
        recentApplications,
        recentEvents,
      });
    } catch (err) {
      console.error("Institution Stats Error:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch stats." });
    }
  },
};

export default InstitutionController;
