import { Request, Response } from "express";
import { prisma } from "../prisma";
import { AuthenticatedInstitutionRequest } from "../middleware/institutionAuth.middleware";

export const EventController = {
  /**
   * Create Event (Multi-Step Wizard Submission)
   */
  async createEvent(req: AuthenticatedInstitutionRequest, res: Response) {
    try {
      if (!req.institution) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }

      const {
        name,
        category,
        sportGame,
        bannerImage,
        shortDescription,
        fullDescription,
        organizer,
        hostingInstitution,
        contactPerson,
        contactEmail,
        contactPhone,
        regStartDate,
        regEndDate,
        startDate,
        endDate,
        reportingTime,
        startTime,
        duration,
        venueName,
        venueAddress,
        city,
        state,
        latitude,
        longitude,
        rounds,
        allowedInstitutionsType = "any",
        selectedInstitutions,
        minAge,
        maxAge,
        gender = "All",
        classGrade,
        collegeYear,
        courseDepartment,
        skillRequirement,
        participationType = "Individual",
        teamMinSize,
        teamMaxSize,
        customEligibility,
        gameFormat,
        rules,
        documents,
        isPaid = false,
        registrationFee = 0,
        gstPercent = 0,
        paymentDeadline,
        refundPolicy,
        visibility = "Public",
        status = "Published",
      } = req.body;

      if (!name || !category || !sportGame || !shortDescription || !startDate || !endDate || !venueName) {
        return res.status(400).json({
          success: false,
          message: "Please complete all required fields for the event.",
        });
      }

      const event = await prisma.event.create({
        data: {
          institutionId: req.institution.id,
          name: name.trim(),
          category,
          sportGame: sportGame.trim(),
          bannerImage: bannerImage || null,
          shortDescription: shortDescription.trim(),
          fullDescription: fullDescription || shortDescription,
          organizer: organizer?.trim() || req.institution.name,
          hostingInstitution: hostingInstitution?.trim() || req.institution.name,
          contactPerson: contactPerson?.trim() || req.institution.name,
          contactEmail: contactEmail?.trim() || req.institution.email,
          contactPhone: contactPhone?.trim() || "",
          regStartDate: regStartDate ? new Date(regStartDate) : new Date(),
          regEndDate: regEndDate ? new Date(regEndDate) : new Date(endDate),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          reportingTime: reportingTime || null,
          startTime: startTime || null,
          duration: duration || null,
          venueName: venueName.trim(),
          venueAddress: venueAddress || venueName,
          city: city?.trim() || "",
          state: state?.trim() || "",
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          rounds: rounds ? JSON.stringify(rounds) : null,
          allowedInstitutionsType,
          selectedInstitutions: selectedInstitutions ? JSON.stringify(selectedInstitutions) : null,
          minAge: minAge ? parseInt(minAge, 10) : null,
          maxAge: maxAge ? parseInt(maxAge, 10) : null,
          gender,
          classGrade: classGrade || null,
          collegeYear: collegeYear || null,
          courseDepartment: courseDepartment || null,
          skillRequirement: skillRequirement || null,
          participationType,
          teamMinSize: teamMinSize ? parseInt(teamMinSize, 10) : null,
          teamMaxSize: teamMaxSize ? parseInt(teamMaxSize, 10) : null,
          customEligibility: customEligibility || null,
          gameFormat: gameFormat ? (typeof gameFormat === "string" ? gameFormat : JSON.stringify(gameFormat)) : null,
          rules: rules ? (typeof rules === "string" ? rules : JSON.stringify(rules)) : null,
          documents: documents ? JSON.stringify(documents) : null,
          isPaid: Boolean(isPaid),
          registrationFee: parseFloat(registrationFee) || 0,
          gstPercent: parseFloat(gstPercent) || 0,
          paymentDeadline: paymentDeadline ? new Date(paymentDeadline) : null,
          refundPolicy: refundPolicy || null,
          visibility,
          status,
        },
      });

      // Notification
      await prisma.notification.create({
        data: {
          institutionId: req.institution.id,
          title: "Event Created Successfully",
          message: `Your event "${event.name}" has been saved as ${event.status}.`,
          link: `/events/${event.id}`,
          type: "success",
        },
      });

      return res.status(201).json({
        success: true,
        message: status === "Draft" ? "Event saved as Draft!" : "Event published successfully!",
        event,
      });
    } catch (err) {
      console.error("Create Event Error:", err);
      return res.status(500).json({ success: false, message: "Failed to create event." });
    }
  },

  /**
   * Update Event
   */
  async updateEvent(req: AuthenticatedInstitutionRequest, res: Response) {
    try {
      if (!req.institution) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }

      const { id } = req.params;
      const existing = await prisma.event.findUnique({ where: { id } });

      if (!existing || existing.institutionId !== req.institution.id) {
        return res.status(404).json({ success: false, message: "Event not found or unauthorized." });
      }

      const data = { ...req.body };
      if (data.startDate) data.startDate = new Date(data.startDate);
      if (data.endDate) data.endDate = new Date(data.endDate);
      if (data.regStartDate) data.regStartDate = new Date(data.regStartDate);
      if (data.regEndDate) data.regEndDate = new Date(data.regEndDate);
      if (data.rounds && typeof data.rounds !== "string") data.rounds = JSON.stringify(data.rounds);
      if (data.rules && typeof data.rules !== "string") data.rules = JSON.stringify(data.rules);
      if (data.gameFormat && typeof data.gameFormat !== "string") data.gameFormat = JSON.stringify(data.gameFormat);
      if (data.documents && typeof data.documents !== "string") data.documents = JSON.stringify(data.documents);

      delete data.id;
      delete data.institutionId;

      const updated = await prisma.event.update({
        where: { id },
        data,
      });

      return res.status(200).json({
        success: true,
        message: "Event updated successfully!",
        event: updated,
      });
    } catch (err) {
      console.error("Update Event Error:", err);
      return res.status(500).json({ success: false, message: "Failed to update event." });
    }
  },

  /**
   * Delete Event
   */
  async deleteEvent(req: AuthenticatedInstitutionRequest, res: Response) {
    try {
      if (!req.institution) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }

      const { id } = req.params;
      const existing = await prisma.event.findUnique({ where: { id } });

      if (!existing || existing.institutionId !== req.institution.id) {
        return res.status(404).json({ success: false, message: "Event not found or unauthorized." });
      }

      await prisma.event.delete({ where: { id } });
      return res.status(200).json({ success: true, message: "Event deleted successfully." });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Failed to delete event." });
    }
  },

  /**
   * Get Events for Logged-In Institution (with filtering)
   */
  async getInstitutionEvents(req: AuthenticatedInstitutionRequest, res: Response) {
    try {
      if (!req.institution) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }

      const { filter = "all" } = req.query;
      const now = new Date();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {
        institutionId: req.institution.id,
      };

      if (filter === "draft") {
        where.status = "Draft";
      } else if (filter === "upcoming") {
        where.status = "Published";
        where.startDate = { gt: now };
      } else if (filter === "ongoing") {
        where.status = "Published";
        where.startDate = { lte: now };
        where.endDate = { gte: now };
      } else if (filter === "completed") {
        where.status = "Published";
        where.endDate = { lt: now };
      }

      const events = await prisma.event.findMany({
        where,
        orderBy: { startDate: "asc" },
        include: {
          _count: {
            select: { applications: true },
          },
        },
      });

      const formatted = events.map((evt) => {
        let dynamicStatus = evt.status;
        if (evt.status === "Published") {
          if (evt.startDate > now) dynamicStatus = "Upcoming";
          else if (evt.startDate <= now && evt.endDate >= now) dynamicStatus = "Ongoing";
          else dynamicStatus = "Completed";
        }

        const isRegClosed = evt.regEndDate < now;

        return {
          ...evt,
          dynamicStatus,
          isRegClosed,
          applicationsCount: evt._count.applications,
        };
      });

      return res.status(200).json({ success: true, events: formatted });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Failed to fetch institution events." });
    }
  },

  /**
   * Student-Facing Event Discovery & Marketplace
   */
  async getPublicEvents(req: Request, res: Response) {
    try {
      const {
        search,
        category,
        sport,
        city,
        state,
        tab = "All",
        freePaid,
        externalOnly,
      } = req.query;

      const now = new Date();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {
        status: "Published",
        visibility: { in: ["Public", "ExternalAllowed"] },
      };

      // Tab handling
      if (tab === "Upcoming") {
        where.startDate = { gt: now };
      } else if (tab === "Ongoing") {
        where.startDate = { lte: now };
        where.endDate = { gte: now };
      } else if (tab === "Completed") {
        where.endDate = { lt: now };
      } else if (tab === "Sports") {
        where.category = { in: ["Sports Tournament", "Athletics", "Football", "Cricket", "Basketball", "Volleyball", "Badminton", "Chess", "Esports"] };
      } else if (tab === "Academic") {
        where.category = { in: ["Academic Competition", "Quiz", "Debate"] };
      } else if (tab === "Cultural") {
        where.category = { in: ["Cultural Event"] };
      } else if (tab === "Competitions") {
        where.category = { not: "Cultural Event" };
      }

      if (category && category !== "All") {
        where.category = { equals: category as string };
      }

      if (sport && sport !== "All") {
        where.sportGame = { contains: sport as string };
      }

      if (city && city !== "All") {
        where.city = { equals: city as string };
      }

      if (state && state !== "All") {
        where.state = { equals: state as string };
      }

      if (freePaid === "free") {
        where.isPaid = false;
      } else if (freePaid === "paid") {
        where.isPaid = true;
      }

      if (externalOnly === "true") {
        where.allowedInstitutionsType = { in: ["any", "external_allowed"] };
      }

      if (search && typeof search === "string" && search.trim().length > 0) {
        const query = search.trim();
        where.OR = [
          { name: { contains: query } },
          { sportGame: { contains: query } },
          { shortDescription: { contains: query } },
          { organizer: { contains: query } },
          { hostingInstitution: { contains: query } },
          { venueName: { contains: query } },
          { city: { contains: query } },
        ];
      }

      const events = await prisma.event.findMany({
        where,
        orderBy: { startDate: "asc" },
        include: {
          institution: {
            select: {
              id: true,
              name: true,
              type: true,
              logo: true,
              city: true,
              state: true,
              isVerified: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
      });

      const formatted = events.map((evt) => {
        let dynamicStatus = "Upcoming";
        if (evt.startDate <= now && evt.endDate >= now) {
          dynamicStatus = "Ongoing";
        } else if (evt.endDate < now) {
          dynamicStatus = "Completed";
        }

        const isRegClosed = evt.regEndDate < now;

        return {
          ...evt,
          dynamicStatus,
          isRegClosed,
          applicationsCount: evt._count.applications,
          rounds: evt.rounds ? JSON.parse(evt.rounds) : [],
          documents: evt.documents ? JSON.parse(evt.documents) : [],
        };
      });

      return res.status(200).json({
        success: true,
        count: formatted.length,
        events: formatted,
      });
    } catch (err) {
      console.error("Public Events Error:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch events." });
    }
  },

  /**
   * Get Single Event By ID
   */
  async getEventById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const now = new Date();

      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          institution: {
            select: {
              id: true,
              name: true,
              type: true,
              logo: true,
              address: true,
              city: true,
              state: true,
              website: true,
              contactNumber: true,
              coordinatorName: true,
              coordinatorEmail: true,
              coordinatorPhone: true,
              isVerified: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
      });

      if (!event) {
        return res.status(404).json({ success: false, message: "Event not found." });
      }

      let dynamicStatus = "Upcoming";
      if (event.startDate <= now && event.endDate >= now) {
        dynamicStatus = "Ongoing";
      } else if (event.endDate < now) {
        dynamicStatus = "Completed";
      }

      const isRegClosed = event.regEndDate < now;

      return res.status(200).json({
        success: true,
        event: {
          ...event,
          dynamicStatus,
          isRegClosed,
          applicationsCount: event._count.applications,
          rounds: event.rounds ? JSON.parse(event.rounds) : [],
          rules: event.rules ? (event.rules.startsWith("{") || event.rules.startsWith("[") ? JSON.parse(event.rules) : event.rules) : null,
          gameFormat: event.gameFormat ? (event.gameFormat.startsWith("{") || event.gameFormat.startsWith("[") ? JSON.parse(event.gameFormat) : event.gameFormat) : null,
          documents: event.documents ? JSON.parse(event.documents) : [],
        },
      });
    } catch (err) {
      console.error("Get Event By ID Error:", err);
      return res.status(500).json({ success: false, message: "Failed to retrieve event." });
    }
  },

  /**
   * Check Student Eligibility against Event
   */
  async checkEligibility(req: Request, res: Response) {
    try {
      const { eventId, student } = req.body;

      if (!eventId || !student) {
        return res.status(400).json({ success: false, message: "Event ID and student profile are required." });
      }

      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) {
        return res.status(404).json({ success: false, message: "Event not found." });
      }

      const issues: string[] = [];
      const studentAge = parseInt(student.age, 10);

      // Age check
      if (event.minAge && studentAge < event.minAge) {
        issues.push(`Minimum age required is ${event.minAge} years (your age: ${studentAge}).`);
      }
      if (event.maxAge && studentAge > event.maxAge) {
        issues.push(`Maximum age allowed is ${event.maxAge} years (your age: ${studentAge}).`);
      }

      // Gender check
      if (event.gender && event.gender !== "All") {
        if (student.gender && student.gender.toLowerCase() !== event.gender.toLowerCase()) {
          issues.push(`This event is exclusively open for ${event.gender} participants.`);
        }
      }

      // External institution check
      if (event.allowedInstitutionsType === "only_ours") {
        if (student.institutionName && !student.institutionName.toLowerCase().includes(event.hostingInstitution.toLowerCase())) {
          issues.push(`Open only for students from ${event.hostingInstitution}.`);
        }
      }

      const isEligible = issues.length === 0;

      return res.status(200).json({
        success: true,
        isEligible,
        reasons: issues,
        eligibilitySummary: event.customEligibility || `Ages ${event.minAge || 'Any'}–${event.maxAge || 'Any'}, ${event.gender} participants`,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Eligibility check failed." });
    }
  },
};

export default EventController;
