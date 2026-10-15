import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const randomHex = crypto.randomBytes(8).toString("hex");
    const sanitizedOriginal = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueName = `${Date.now()}_${randomHex}_${sanitizedOriginal}`;
    cb(null, uniqueName);
  },
});

const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30 MB max
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file format (${file.mimetype}). Allowed: JPG, PNG, WEBP, PDF, MP4, WEBM`));
    }
  },
});

function getFilePublicUrl(req: Request, filename: string): string {
  if (process.env.BACKEND_URL) {
    return `${process.env.BACKEND_URL.replace(/\/$/, "")}/uploads/${filename}`;
  }
  if (process.env.NODE_ENV === "production") {
    return `https://sportrise.onrender.com/uploads/${filename}`;
  }
  const host = req.get("host");
  if (host) {
    return `${req.protocol}://${host}/uploads/${filename}`;
  }
  return `/uploads/${filename}`;
}

export const UploadController = {
  uploadMiddleware,

  async handleSingleUpload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded." });
      }

      const file = req.file;
      const fileUrl = getFilePublicUrl(req, file.filename);

      return res.status(200).json({
        success: true,
        message: "File uploaded successfully.",
        file: {
          url: fileUrl,
          originalName: file.originalname,
          fileName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || "File upload failed." });
    }
  },

  async handleMultipleUploads(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, message: "No files uploaded." });
      }

      const uploadedFiles = files.map((file) => ({
        url: getFilePublicUrl(req, file.filename),
        originalName: file.originalname,
        fileName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
      }));

      return res.status(200).json({
        success: true,
        message: `${files.length} file(s) uploaded successfully.`,
        files: uploadedFiles,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || "Uploads failed." });
    }
  },
};

export default UploadController;
