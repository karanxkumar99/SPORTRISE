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
        athleteId,
        applicantName,
        dob,
        age,
        gender,
        institutionName,
        classOrYear,
        courseDepartment,
        studentIdCardNumber,
        contactNumber,
        whatsappNumber,
        email,
        sportCategory,
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

      // Validate Athlete ID if provided
      let resolvedAthleteId: string | null = null;
      let resolvedUserId: string | null = userId || null;

      if (athleteId && typeof athleteId === "string" && athleteId.trim()) {
        const cleanAthleteId = athleteId.trim();
        const matchedAthlete = await prisma.user.findFirst({
          where: {
            OR: [
              { athleteId: { equals: cleanAthleteId } },
              { athleteId: { equals: cleanAthleteId.toUpperCase() } },
            ],
          },
        });

        if (!matchedAthlete) {
          return res.status(400).json({
            success: false,
            message: `Invalid Athlete ID "${cleanAthleteId}". Please enter a valid Athlete ID registered on SportRise.`,
          });
        }

        resolvedAthleteId = matchedAthlete.athleteId;
        resolvedUserId = matchedAthlete.id;
      } else if (userId) {
        const userRecord = await prisma.user.findUnique({
          where: { id: userId },
          select: { athleteId: true },
        });
        if (userRecord?.athleteId) {
          resolvedAthleteId = userRecord.athleteId;
        }
      }

      // Duplicate registration prevention check
      const duplicateConditions: any[] = [{ email: email.trim().toLowerCase() }];
      if (resolvedAthleteId) {
        duplicateConditions.push({ athleteId: resolvedAthleteId });
      }
      if (resolvedUserId) {
        duplicateConditions.push({ userId: resolvedUserId });
      }

      const existing = await prisma.application.findFirst({
        where: {
          eventId,
          OR: duplicateConditions,
        },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: `You have already registered for this event (Application ID: ${existing.applicationNumber}). Duplicate registrations for the same event are not permitted.`,
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
          userId: resolvedUserId,
          athleteId: resolvedAthleteId,
          applicantName: applicantName.trim(),
          sportCategory: sportCategory?.trim() || event.sportGame || event.category,
          dob: dob ? new Date(dob) : null,
          age: parseInt(age, 10),
          gender,
          institutionName: institutionName.trim(),
          classOrYear: classOrYear?.trim() || "",
          courseDepartment: courseDepartment?.trim() || null,
          studentIdCardNumber: studentIdCardNumber?.trim() || null,
          contactNumber: contactNumber.trim(),
          whatsappNumber: whatsappNumber?.trim() || contactNumber.trim(),
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
          message: `${applicantName} (${institutionName}) registered for "${event.name}". Application ID: ${applicationNumber}.`,
          link: `/institution/applications`,
          type: "info",
        },
      });

      // Notify student if user ID is present
      if (resolvedUserId) {
        await prisma.notification.create({
          data: {
            userId: resolvedUserId,
            title: "Application Submitted Successfully",
            message: `Your registration for "${event.name}" is submitted. Keep Application #${applicationNumber} for reference.`,
            link: `/dashboard/applications`,
            type: "success",
          },
        });
      }

      return res.status(201).json({
        success: true,
        message: "Your response has been submitted successfully!",
        notificationMessage: "We will notify you about important event information through your mobile number and WhatsApp.",
        applicationNumber,
        application,
      });
    } catch (err) {
      console.error("Apply Error:", err);
      return res.status(500).json({ success: false, message: "Application submission failed." });
    }
  },

  /**
   * Lookup Athlete Details by Athlete ID
   */
  async lookupAthlete(req: Request, res: Response) {
    try {
      const { athleteId } = req.params;
      if (!athleteId || typeof athleteId !== "string" || !athleteId.trim()) {
        return res.status(400).json({ success: false, message: "Athlete ID is required." });
      }

      const trimmedId = athleteId.trim();
      const athlete = await prisma.user.findFirst({
        where: {
          OR: [
            { athleteId: { equals: trimmedId } },
            { athleteId: { equals: trimmedId.toUpperCase() } },
          ],
        },
        select: {
          id: true,
          athleteId: true,
          fullName: true,
          mobile: true,
          email: true,
          gender: true,
          dob: true,
          ageCategory: true,
          sport: true,
          state: true,
          district: true,
          achievements: true,
        },
      });

      if (!athlete) {
        return res.status(404).json({
          success: false,
          message: `No athlete found with Athlete ID "${trimmedId}". Please verify your Athlete ID or register as an athlete first.`,
        });
      }

      // Calculate age from dob or ageCategory
      let calculatedAge = 18;
      if (athlete.dob) {
        const birth = new Date(athlete.dob);
        const today = new Date();
        calculatedAge = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          calculatedAge--;
        }
      } else if (athlete.ageCategory) {
        const parsed = parseInt(athlete.ageCategory.replace(/\D/g, ""), 10);
        if (!isNaN(parsed) && parsed >= 5 && parsed <= 60) calculatedAge = parsed;
      }

      return res.status(200).json({
        success: true,
        athlete: {
          userId: athlete.id,
          athleteId: athlete.athleteId,
          applicantName: athlete.fullName,
          email: athlete.email,
          contactNumber: athlete.mobile,
          whatsappNumber: athlete.mobile,
          gender: athlete.gender || "Male",
          dob: athlete.dob ? athlete.dob.toISOString().split("T")[0] : null,
          age: calculatedAge,
          sportCategory: athlete.sport,
          state: athlete.state,
          district: athlete.district,
          institutionName: `${athlete.district} District Sports Academy`,
          achievements: athlete.achievements || "",
        },
      });
    } catch (err) {
      console.error("Lookup Athlete Error:", err);
      return res.status(500).json({ success: false, message: "Failed to look up athlete details." });
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

      const { eventId, status, search, sortBy = "createdAt", sortOrder = "desc" } = req.query;

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
          { athleteId: { contains: q } },
          { email: { contains: q } },
          { institutionName: { contains: q } },
          { contactNumber: { contains: q } },
          { whatsappNumber: { contains: q } },
          { sportCategory: { contains: q } },
        ];
      }

      const orderBy: any = {};
      const validSort = ["createdAt", "applicantName", "athleteId", "status"];
      const chosenSort = validSort.includes(sortBy as string) ? (sortBy as string) : "createdAt";
      orderBy[chosenSort] = sortOrder === "asc" ? "asc" : "desc";

      const [applications, institutionEvents] = await Promise.all([
        prisma.application.findMany({
          where,
          orderBy,
          include: {
            event: {
              select: {
                id: true,
                name: true,
                sportGame: true,
                category: true,
                startDate: true,
                status: true,
              },
            },
            user: {
              select: {
                id: true,
                athleteId: true,
                fullName: true,
                mobile: true,
                email: true,
                sport: true,
              },
            },
          },
        }),
        prisma.event.findMany({
          where: { institutionId: req.institution.id },
          select: {
            id: true,
            name: true,
            sportGame: true,
            status: true,
            startDate: true,
            _count: {
              select: { applications: true },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      const eventSummaries = institutionEvents.map((evt) => ({
        id: evt.id,
        name: evt.name,
        sportGame: evt.sportGame,
        status: evt.status,
        startDate: evt.startDate,
        registeredCount: evt._count.applications,
      }));

      const totalRegistrations = institutionEvents.reduce((acc, evt) => acc + evt._count.applications, 0);

      const formatted = applications.map((app) => ({
        ...app,
        athleteId: app.athleteId || app.user?.athleteId || null,
        whatsappNumber: app.whatsappNumber || app.contactNumber || null,
        sportCategory: app.sportCategory || app.event.sportGame || app.event.category,
      }));

      return res.status(200).json({
        success: true,
        count: formatted.length,
        totalRegistrations,
        eventSummaries,
        applications: formatted,
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
