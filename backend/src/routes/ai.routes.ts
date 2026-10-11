import { Router } from "express";
import AiController from "../controllers/ai.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/assess", requireAuth, AiController.assessAndSavePerformance);
router.post("/preview", AiController.previewScore);
router.get("/history", requireAuth, AiController.getPerformanceHistory);

export default router;
