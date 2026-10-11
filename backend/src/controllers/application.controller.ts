import { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../prisma";
import { AuthenticatedInstitutionRequest } from "../middleware/institutionAuth.middleware";

export const ApplicationController = {
  /**
   * Submit Event Application (Student Flow)
   */
  async apply(req: Request, res: Response) {
    try {
      const {
        eventId,
        userId,
        applicantName,
        dob,
        age,
        gender,
        institutionName,
        classOrYear,
        courseDepartment,
        studentIdCardNumber,
        contactNumber,
        email,
        parentName,
        parentContact,
        emergencyContact,
        experience,
        achievements,
        idProofUrl,
        documentsUrl,
        isTeam = false,
        teamName,
        captainName,
        teamMembers,
      } = req.body;

      if (!eventId || !applicantName || !age || !gender || !institutionName || !contactNumber || !email) {
        return res.status(400).json({
          success: false,
          message: "Please fill in all mandatory application fields.",
        });
      }

      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { institution: true },
      });

      if (!event) {
        return res.status(404).json({ success: false, message: "Target event not found." });
      }

      const now = new Date();
      if (event.regEndDate < now) {
        return res.status(400).json({
          success: false,
          message: "Registration for this event is now closed.",
        });
      }

      // Check if already applied
      const existing = await prisma.application.findFirst({
        where: {
          eventId,
          email: email.trim().toLowerCase(),
        },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: `You have already applied for this event (Application ID: ${existing.applicationNumber}).`,
          applicationNumber: existing.applicationNumber,
        });
      }

      // Generate unique application number e.g. APP-EVT-26-48912
      const randomCode = Math.floor(10000 + Math.random() * 90000).toString();
      const applicationNumber = `APP-EVT-26-${randomCode}`;

      const application = await prisma.application.create({
        data: {
          applicationNumber,
          eventId,
          userId: userId || null,
          applicantName: applicantName.trim(),
          dob: dob ? new Date(dob) : null,
          age: parseInt(age, 10),
          gender,
          institutionName: institutionName.trim(),
          classOrYear: classOrYear?.trim() || "",
          courseDepartment: courseDepartment?.trim() || null,
          studentIdCardNumber: studentIdCardNumber?.trim() || null,
          contactNumber: contactNumber.trim(),
          email: email.trim().toLowerCase(),
          parentName: parentName?.trim() || null,
          parentContact: parentContact?.trim() || null,
          emergencyContact: emergencyContact?.trim() || null,
          experience: experience?.trim() || null,
          achievements: achievements?.trim() || null,
          idProofUrl: idProofUrl || null,
          documentsUrl: documentsUrl || null,
          isTeam: Boolean(isTeam),
          teamName: teamName?.trim() || null,
          captainName: captainName?.trim() || applicantName.trim(),
          teamMembers: teamMembers ? JSON.stringify(teamMembers) : null,
          status: "Submitted",
        },
      });

      // Notify institution
      await prisma.notification.create({
        data: {
          institutionId: event.institutionId,
          title: "New Student Application",
          message: `${applicantName} (${institutionName}) applied for "${event.name}". Application ID: ${applicationNumber}.`,
          link: `/institution/applications`,
          type: "info",
        },
      });

      // Notify student if user ID is present
      if (userId) {
        await prisma.notification.create({
          data: {
            userId,
            title: "Application Submitted Successfully",
            message: `Your registration for "${event.name}" is submitted. Keep Application #${applicationNumber} for reference.`,
            link: `/dashboard/applications`,
            type: "success",
          },
        });
      }

      return res.status(201).json({
        success: true,
        message: "Application submitted successfully!",
        applicationNumber,
        application,
      });
    } catch (err) {
      console.error("Apply Error:", err);
      return res.status(500).json({ success: false, message: "Application submission failed." });
    }
  },

  /**
   * Get Student Applications (Student Dashboard)
   */
  async getMyApplications(req: Request, res: Response) {
    try {
      const { email, userId } = req.query;

      if (!email && !userId) {
        return res.status(400).json({ success: false, message: "Email or User ID required." });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};
      if (userId) {
        where.userId = userId as string;
      } else if (email) {
        where.email = (email as string).trim().toLowerCase();
      }

      const applications = await prisma.application.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          event: {
            select: {
              id: true,
              name: true,
              category: true,
              sportGame: true,
              bannerImage: true,
              startDate: true,
              endDate: true,
              venueName: true,
              city: true,
              hostingInstitution: true,
            },
          },
        },
      });

      return res.status(200).json({ success: true, count: applications.length, applications });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Failed to fetch student applications." });
    }
  },

  /**
   * Get Applications for Institution Dashboard
   */
  async getInstitutionApplications(req: AuthenticatedInstitutionRequest, res: Response) {
    try {
      if (!req.institution) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }

      const { eventId, status, search } = req.query;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {
        event: {
          institutionId: req.institution.id,
        },
      };

      if (eventId && eventId !== "All") {
        where.eventId = eventId as string;
      }

      if (status && status !== "All") {
        where.status = status as string;
      }

      if (search && typeof search === "string" && search.trim().length > 0) {
        const q = search.trim();
        where.OR = [
          { applicantName: { contains: q } },
          { applicationNumber: { contains: q } },
          { email: { contains: q } },
          { institutionName: { contains: q } },
          { contactNumber: { contains: q } },
        ];
      }

      const applications = await prisma.application.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          event: {
            select: {
              id: true,
              name: true,
              sportGame: true,
              category: true,
              startDate: true,
            },
          },
        },
      });

      return res.status(200).json({
        success: true,
        count: applications.length,
        applications,
      });
    } catch (err) {
      console.error("Institution Applications Error:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch applications." });
    }
  },

  /**
   * Update Application Status (Approve, Reject, Waitlist, Notes)
   */
  async updateStatus(req: AuthenticatedInstitutionRequest, res: Response) {
    try {
      if (!req.institution) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }

      const { id } = req.params;
      const { status, organizerNotes } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: "Status is required." });
      }

      const application = await prisma.application.findUnique({
        where: { id },
        include: { event: true },
      });

      if (!application || application.event.institutionId !== req.institution.id) {
        return res.status(404).json({ success: false, message: "Application not found or unauthorized." });
      }

      const updated = await prisma.application.update({
        where: { id },
        data: {
          status,
          organizerNotes: organizerNotes !== undefined ? organizerNotes : application.organizerNotes,
        },
      });

      // Notify student
      if (application.userId) {
        await prisma.notification.create({
          data: {
            userId: application.userId,
            title: `Application ${status}: ${application.event.name}`,
            message: `Your registration for "${application.event.name}" is now marked as ${status}. ${organizerNotes ? `Note: ${organizerNotes}` : ""}`,
            link: `/dashboard/applications`,
            type: status === "Approved" ? "success" : status === "Rejected" ? "alert" : "info",
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: `Application marked as ${status}!`,
        application: updated,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Failed to update application status." });
    }
  },
};

export default ApplicationController;
