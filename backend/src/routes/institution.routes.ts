import { Router } from "express";
import InstitutionController from "../controllers/institution.controller";
import { requireInstitutionAuth } from "../middleware/institutionAuth.middleware";

const router = Router();

router.post("/register", InstitutionController.register);
router.post("/verify-otp", InstitutionController.verifyOtp);
router.post("/resend-otp", InstitutionController.resendOtp);
router.post("/login", InstitutionController.login);
router.get("/profile", requireInstitutionAuth, InstitutionController.getProfile);
router.put("/profile", requireInstitutionAuth, InstitutionController.updateProfile);
router.get("/stats", requireInstitutionAuth, InstitutionController.getStats);

export default router;
