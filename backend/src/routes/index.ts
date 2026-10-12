import { Router } from "express";
import authRoutes from "./auth.routes";
import sportsRoutes from "./sports.routes";
import rankingRoutes from "./ranking.routes";
import aiRoutes from "./ai.routes";
import institutionRoutes from "./institution.routes";
import eventRoutes from "./event.routes";
import applicationRoutes from "./application.routes";
import adminRoutes from "./admin.routes";
import notificationRoutes from "./notification.routes";
import matchRoutes from "./match.routes";
import uploadRoutes from "./upload.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/sports", sportsRoutes);
apiRouter.use("/ranking", rankingRoutes);
apiRouter.use("/ai", aiRoutes);
apiRouter.use("/institutions", institutionRoutes);
apiRouter.use("/events", eventRoutes);
apiRouter.use("/applications", applicationRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use("/matches", matchRoutes);
apiRouter.use("/upload", uploadRoutes);

apiRouter.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    project: "SPORTRISE (खेल उत्थान)",
    version: "2.1.0",
    modules: [
      "Athlete Portal",
      "School & College Event Management",
      "Verified Match & Evidence Submission Engine",
      "Anti-Cheating & Audit System",
      "Deterministic 0-100 & AI Ranking Engine",
    ],
    timestamp: new Date().toISOString(),
  });
});

export default apiRouter;
