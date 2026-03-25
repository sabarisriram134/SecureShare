import express from "express";
import { requestAccess, verifyAccess, downloadTacticalFile, getTacticalFileMeta } from "../controllers/tactical.controller.js";

const router = express.Router();

// Get file metadata for the tactical share page (to know access level)
router.get("/meta/:cid", getTacticalFileMeta);

// Request OTP(s)
router.post("/request-access", requestAccess);

// Verify OTP(s) and get download token
router.post("/verify-access", verifyAccess);

// Download file using the secure token
router.get("/download/:token", downloadTacticalFile);

export default router;
