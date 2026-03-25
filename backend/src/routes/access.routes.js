import express from "express";
import accessController from "../controllers/access.controller.js";
import authMiddleware from "../middlewares/authmiddleware.js";
import { sendAccessCode, verifyAccessCode } from "../services/email.service.js";
import User from "../models/User.js";

const router = express.Router();

// Grant access
router.post("/grant", authMiddleware, accessController.grantAccess);

// Revoke access
router.post("/revoke", authMiddleware, accessController.revokeAccess);

// Request access code for a file (send email)
router.post("/request-code/:cid", authMiddleware, async (req, res) => {
  try {
    const { cid } = req.params;
    const userId = req.user?.userId;

    let file, email;

    const user = await User.findById(userId);
    email = req.body.email || user?.email;
    file = user?.files?.find((f) => f.cid === cid);

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Send access code
    await sendAccessCode(email, file.fileName, cid);

    res.json({
      message: "Access code sent to your email",
      email: email.replace(/(.{2})(.*)(@.*)/, "$1***$3"), // Masked email
      expiresIn: 900 // 15 minutes
    });
  } catch (err) {
    console.error("Access request error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Verify access code
router.post("/verify-code/:cid", authMiddleware, async (req, res) => {
  try {
    const { cid } = req.params;
    const { code, email } = req.body;

    if (!code || !email) {
      return res.status(400).json({ error: "Code and email are required" });
    }

    // Verify the access code
    const verification = verifyAccessCode(email, cid, code);

    if (!verification.valid) {
      return res.status(401).json({ error: verification.message });
    }

    res.json({
      success: true,
      message: "Access granted - you can now download the file",
      accessGranted: true
    });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
