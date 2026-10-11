import { Router } from "express";
import AdminController from "../controllers/admin.controller";

const router = Router();

router.get("/overview", AdminController.getOverview);
router.put("/institution/:id/verify", AdminController.toggleInstitutionVerification);
router.put("/event/:id/moderate", AdminController.moderateEvent);

export default router;
