import { Router } from "express";
import RankingController from "../controllers/ranking.controller";

const router = Router();

router.get("/leaderboard", RankingController.getLeaderboard);
router.get("/states-summary", RankingController.getStateRankingsSummary);

export default router;
