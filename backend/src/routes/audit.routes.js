import express from "express";
import auditController from "../controllers/audit.controller.js";
import authMiddleware from "../middlewares/authmiddleware.js";

const router = express.Router();

// Fetch audit logs
router.get("/", authMiddleware, auditController.getAuditLogs);

export default router;
