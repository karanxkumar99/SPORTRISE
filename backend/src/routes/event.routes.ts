import { Router } from "express";
import EventController from "../controllers/event.controller";
import { requireInstitutionAuth } from "../middleware/institutionAuth.middleware";

const router = Router();

// Public routes
router.get("/public", EventController.getPublicEvents);
router.get("/detail/:id", EventController.getEventById);
router.post("/check-eligibility", EventController.checkEligibility);

// Institution protected routes
router.post("/create", requireInstitutionAuth, EventController.createEvent);
router.put("/:id", requireInstitutionAuth, EventController.updateEvent);
router.delete("/:id", requireInstitutionAuth, EventController.deleteEvent);
router.get("/institution-events", requireInstitutionAuth, EventController.getInstitutionEvents);

export default router;
