import { Router } from "express";
import UploadController from "../controllers/upload.controller";

const router = Router();

router.post("/single", UploadController.uploadMiddleware.single("file"), UploadController.handleSingleUpload);
router.post("/multiple", UploadController.uploadMiddleware.array("files", 10), UploadController.handleMultipleUploads);

export default router;
