import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    athleteId: string;
    email: string;
    sport: string;
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authentication required. Please log in." });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "sportrise_grassroots_sports_secret_token_key_2026";

    const decoded = jwt.verify(token, secret) as { id: string; email: string; role?: string };

    if (decoded.role === "institution") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Institution accounts cannot access Athlete endpoints.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        athleteId: true,
        email: true,
        sport: true,
        fullName: true,
        isVerified: true,
        state: true,
        district: true,
        skillIndex: true,
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Athlete account not found." });
    }

    req.user = {
      id: user.id,
      athleteId: user.athleteId,
      email: user.email,
      sport: user.sport,
    };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired session token." });
  }
}
