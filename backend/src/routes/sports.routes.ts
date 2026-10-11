import { Router } from "express";
import SportsController from "../controllers/sports.controller";

const router = Router();

router.get("/", SportsController.getAllSports);
router.get("/categories", SportsController.getCategories);
router.get("/:sportSlug", SportsController.getSportBySlug);

export default router;
