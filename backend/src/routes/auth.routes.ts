import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", AuthController.register);
router.post("/verify-otp", AuthController.verifyOtp);
router.post("/resend-otp", AuthController.resendOtp);
router.post("/login", AuthController.login);
router.get("/profile", requireAuth, AuthController.getProfile);
router.put("/profile", requireAuth, AuthController.updateProfile);
router.get("/athletes/:id", AuthController.getPublicAthleteProfile);

export default router;
