import { Router } from "express";
import NotificationController from "../controllers/notification.controller";

const router = Router();

router.get("/", NotificationController.getNotifications);
router.put("/:id/read", NotificationController.markRead);

export default router;
