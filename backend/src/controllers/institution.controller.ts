import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { AuthenticatedInstitutionRequest } from "../middleware/institutionAuth.middleware";

export const InstitutionController = {
  /**
   * Institution Registration Flow
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

      const normalizedEmail = email.trim().toLowerCase();
      const existing = await prisma.institution.findUnique({
        where: { email: normalizedEmail },
      });

      if (existing) {
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
          isVerified: true, // auto-verified for onboarding ease
        },
      });

      // Initial welcome notification
      await prisma.notification.create({
        data: {
          institutionId: institution.id,
          title: "Welcome to SportRise Event Portal",
          message: `Your institution profile for ${institution.name} has been successfully created. You can now publish your first sports or cultural event.`,
          type: "success",
        },
      });

      const secret = process.env.JWT_SECRET || "sportrise_grassroots_sports_secret_token_key_2026";
      const token = jwt.sign(
        { id: institution.id, email: institution.email, role: "institution" },
        secret,
        { expiresIn: "7d" }
      );

      return res.status(201).json({
        success: true,
        message: "Institution account successfully registered!",
        token,
        institution: {
          id: institution.id,
          name: institution.name,
          type: institution.type,
          logo: institution.logo,
          email: institution.email,
          contactNumber: institution.contactNumber,
          website: institution.website,
          address: institution.address,
          city: institution.city,
          state: institution.state,
          country: institution.country,
          pincode: institution.pincode,
          authorizedPersonName: institution.authorizedPersonName,
          authorizedPersonContact: institution.authorizedPersonContact,
          description: institution.description,
          coordinatorName: institution.coordinatorName,
          coordinatorEmail: institution.coordinatorEmail,
          coordinatorPhone: institution.coordinatorPhone,
          isVerified: institution.isVerified,
        },
      });
    } catch (err) {
      console.error("Institution Register Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to register institution. Please check your data.",
      });
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

      const secret = process.env.JWT_SECRET || "sportrise_grassroots_sports_secret_token_key_2026";
      const token = jwt.sign(
        { id: institution.id, email: institution.email, role: "institution" },
        secret,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        success: true,
        message: "Institution sign-in successful!",
        token,
        institution: {
          id: institution.id,
          name: institution.name,
          type: institution.type,
          logo: institution.logo,
          email: institution.email,
          contactNumber: institution.contactNumber,
          website: institution.website,
          address: institution.address,
          city: institution.city,
          state: institution.state,
          pincode: institution.pincode,
          authorizedPersonName: institution.authorizedPersonName,
          authorizedPersonContact: institution.authorizedPersonContact,
          description: institution.description,
          coordinatorName: institution.coordinatorName,
          coordinatorEmail: institution.coordinatorEmail,
          coordinatorPhone: institution.coordinatorPhone,
          isVerified: institution.isVerified,
        },
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

      // Omit password
      const { password, ...safeData } = inst;
      return res.status(200).json({ success: true, institution: safeData });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Failed to fetch profile." });
    }
  },

  /**
   * Update Profile
   */
  async updateProfile(req: AuthenticatedInstitutionRequest, res: Response) {
    try {
      if (!req.institution) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }

      const updateData = { ...req.body };
      delete updateData.password; // Do not allow direct password override here
      delete updateData.id;

      if (updateData.latitude !== undefined) {
        updateData.latitude = updateData.latitude ? parseFloat(updateData.latitude) : null;
      }
      if (updateData.longitude !== undefined) {
        updateData.longitude = updateData.longitude ? parseFloat(updateData.longitude) : null;
      }

      const updated = await prisma.institution.update({
        where: { id: req.institution.id },
        data: updateData,
      });

      const { password, ...safeData } = updated;
      return res.status(200).json({
        success: true,
        message: "Institution profile updated successfully!",
        institution: safeData,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Failed to update profile." });
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
