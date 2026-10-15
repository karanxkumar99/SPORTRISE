import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import apiRouter from "./routes";

import fs from "fs";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (Render, Vercel, Cloudflare, etc.)
app.set("trust proxy", 1);

// Allowed origins for CORS (Production Vercel frontend, local dev, custom domains)
const allowedOrigins = [
  "https://sportrise.vercel.app",
  "https://sportrise.onrender.com",
  "http://localhost:3000",
  "http://localhost:5000",
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

const corsOptions: cors.CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow non-browser requests (mobile apps, server-to-server, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Vercel preview deployments (*.vercel.app)
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Allow local development ports
    if (process.env.NODE_ENV !== "production" && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded evidence & media statically with Cross-Origin headers
const uploadsPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    next();
  },
  express.static(uploadsPath)
);

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
