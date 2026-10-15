import { Router } from "express";
import ApplicationController from "../controllers/application.controller";
import { requireInstitutionAuth } from "../middleware/institutionAuth.middleware";

const router = Router();

// Student routes
router.post("/apply", ApplicationController.apply);
router.get("/lookup-athlete/:athleteId", ApplicationController.lookupAthlete);
router.get("/my-applications", ApplicationController.getMyApplications);

// Institution routes
router.get("/institution-list", requireInstitutionAuth, ApplicationController.getInstitutionApplications);
router.put("/:id/status", requireInstitutionAuth, ApplicationController.updateStatus);

export default router;
