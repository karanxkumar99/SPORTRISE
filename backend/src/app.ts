import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import apiRouter from "./routes";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: true, // Allow frontend origin dynamically
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded evidence & media statically
const uploadsPath = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));

// Request logger in dev
if (process.env.NODE_ENV !== "production") {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use("/api", apiRouter);

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "🏆 Welcome to SPORTRISE (खेल उत्थान) API Engine",
    description: "Grassroots Youth Sports Talent Digitization & AI Assessment Platform",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      institutions: "/api/institutions",
      matches: "/api/matches",
      upload: "/api/upload",
      events: "/api/events",
      sports: "/api/sports",
      ranking: "/api/ranking",
    },
    documentation: "See README.md for complete API documentation and test guides.",
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found on SPORTRISE server.`,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({
    success: false,
    message: "An internal server error occurred.",
    error: process.env.NODE_ENV !== "production" ? err.message : undefined,
  });
});

// Start server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🇮🇳 SPORTRISE (खेल उत्थान) BACKEND API ACTIVE`);
    console.log(`🚀 Server running on: http://localhost:${PORT}`);
    console.log(`📡 API Health Check:  http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}

export default app;
