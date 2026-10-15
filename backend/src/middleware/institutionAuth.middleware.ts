import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

export interface AuthenticatedInstitutionRequest extends Request {
  institution?: {
    id: string;
    name: string;
    email: string;
    type: string;
    isVerified: boolean;
  };
}

export async function requireInstitutionAuth(
  req: AuthenticatedInstitutionRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Institution authentication required. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "sportrise_grassroots_sports_secret_token_key_2026";

    const decoded = jwt.verify(token, secret) as { id: string; email: string; role?: string };

    if (decoded.role !== "institution") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Athlete accounts are not authorized to access Institution endpoints.",
      });
    }

    const institution = await prisma.institution.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        isVerified: true,
      },
    });

    if (!institution) {
      return res.status(401).json({
        success: false,
        message: "Institution account not found.",
      });
    }

    req.institution = institution;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired institution session token.",
    });
  }
}
