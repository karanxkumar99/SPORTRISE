import { Router } from "express";
import MatchController from "../controllers/match.controller";
import { requireInstitutionAuth } from "../middleware/institutionAuth.middleware";

const router = Router();

router.post("/", requireInstitutionAuth, MatchController.createMatch);
router.post("/analyze-scorecard", requireInstitutionAuth, MatchController.analyzeScorecard);
router.get("/", MatchController.getMatches);
router.get("/:id", MatchController.getMatchById);
router.put("/:id/review", MatchController.reviewMatch); // Admin / Authorized Reviewer
router.post("/:id/dispute", MatchController.raiseDispute);

export default router;
