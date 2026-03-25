import crypto from "crypto";
import User from "../models/User.js";
import { sendAccessCode as sendEmailCode, verifyAccessCode as verifyEmailCode } from "../services/email.service.js";
import { sendSMSCode, verifySMSCode } from "../services/sms.service.js";
import { downloadFromPinata } from "../config/ipfs.js";
import { decryptFile } from "../services/encryption.service.js";
import { comparePassword } from "../utils/auth.js";

// Store temporary download tokens
const downloadTokens = new Map();

const getFileOwner = async (cid) => {
    const user = await User.findOne({ "files.cid": cid });
    if (user && user.files && user.files.length > 0) {
        const file = user.files.find(f => f.cid === cid);
        return { file, owner: user };
    }
    return null;
};

export const requestAccess = async (req, res) => {
    try {
        const { cid } = req.body;
        console.log("[Tactical] Request Access - CID:", cid);
        
        const data = await getFileOwner(cid);

        if (!data || !data.file) {
            console.log("[Tactical] File not found:", cid);
            return res.status(404).json({ error: "File not found" });
        }

        const { file, owner } = data;
        const accessLevel = file.accessLevel || "private";
        console.log("[Tactical] Access Level:", accessLevel, "File:", file.fileName);

        if (accessLevel === "public") {
            console.log("[Tactical] Public file - no OTP needed");
            return res.json({ message: "No OTP required for public files", accessLevel });
        }

        const sentTo = [];

        // Send Email OTP
        if (accessLevel === "private" || accessLevel === "restricted") {
            if (!owner.email) {
                console.error("[Tactical] Owner email not found");
                return res.status(500).json({ error: "File owner does not have a registered email address" });
            }
            const maskedEmail = owner.email.replace(/(.{2})(.*)(@.*)/, "$1***$3");
            console.log("[Tactical] Sending email OTP to:", owner.email);
            await sendEmailCode(owner.email, file.fileName, cid);
            sentTo.push(`Email (${maskedEmail})`);
            console.log("[Tactical] Email OTP sent successfully");
        }

        // Send SMS OTP
        if (accessLevel === "restricted") {
            if (!owner.phoneNumber) {
                console.error("[Tactical] Owner phone not found");
                return res.status(500).json({ error: "File owner does not have a registered phone number" });
            }
            const maskedPhone = owner.phoneNumber.slice(0, 4) + '****' + owner.phoneNumber.slice(-2);
            console.log("[Tactical] Sending SMS OTP to:", owner.phoneNumber);
            await sendSMSCode(owner.phoneNumber, cid);
            sentTo.push(`SMS (${maskedPhone})`);
            console.log("[Tactical] SMS OTP sent successfully");
        }

        const message = `Authorization codes sent to file owner's ${sentTo.join(' and ')}`;
        console.log("[Tactical] Request Access Response:", { message, accessLevel });
        res.json({
            message,
            accessLevel
        });

    } catch (err) {
        console.error("[Tactical] Request access error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const verifyAccess = async (req, res) => {
    try {
        const { cid, emailCode, smsCode, password } = req.body;
        console.log("[Tactical] Verify Access - CID:", cid);
        
        const data = await getFileOwner(cid);

        if (!data || !data.file) {
            console.log("[Tactical] File not found for verification:", cid);
            return res.status(404).json({ error: "File not found" });
        }

        const { file, owner } = data;
        const accessLevel = file.accessLevel || "private";
        console.log("[Tactical] Verifying access level:", accessLevel);

        if (accessLevel !== "public") {
            if (!password) {
                console.log("[Tactical] Password missing");
                return res.status(400).json({ error: "File Owner Password required" });
            }

            // Verify password using auth utility
            console.log("[Tactical] Verifying password");
            const isPasswordValid = await comparePassword(password, owner.passwordHash);
            if (!isPasswordValid) {
                console.log("[Tactical] Invalid password");
                return res.status(401).json({ error: "Invalid Account Password" });
            }
            console.log("[Tactical] Password verified");

            if (!emailCode) {
                console.log("[Tactical] Email OTP missing");
                return res.status(400).json({ error: "Email OTP required" });
            }
            console.log("[Tactical] Verifying email OTP");
            const emailVerification = verifyEmailCode(owner.email, cid, emailCode);
            if (!emailVerification.valid) {
                console.log("[Tactical] Email OTP verification failed:", emailVerification.message);
                return res.status(401).json({ error: emailVerification.message });
            }
            console.log("[Tactical] Email OTP verified");
        }

        if (accessLevel === "restricted") {
            if (!smsCode) {
                console.log("[Tactical] SMS OTP missing");
                return res.status(400).json({ error: "SMS OTP required" });
            }
            console.log("[Tactical] Verifying SMS OTP");
            const smsVerification = verifySMSCode(owner.phoneNumber, cid, smsCode);
            if (!smsVerification.valid) {
                console.log("[Tactical] SMS OTP verification failed:", smsVerification.message);
                return res.status(401).json({ error: smsVerification.message });
            }
            console.log("[Tactical] SMS OTP verified");
        }

        // Generate secure 1-time download token
        const token = crypto.randomBytes(32).toString("hex");
        downloadTokens.set(token, {
            cid,
            expiresAt: Date.now() + 15 * 60 * 1000 // 15 mins
        });

        console.log("[Tactical] Download token generated:", token.substring(0, 8));
        res.json({ success: true, token, fileName: file.fileName });
    } catch (err) {
        console.error("[Tactical] Verify access error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const downloadTacticalFile = async (req, res) => {
    try {
        const { token } = req.params;
        const tokenData = downloadTokens.get(token);

        if (!tokenData || Date.now() > tokenData.expiresAt) {
            if (tokenData) downloadTokens.delete(token); // Cleanup if expired
            return res.status(401).json({ error: "Invalid or expired download token" });
        }

        const { cid } = tokenData;
        const data = await getFileOwner(cid);

        if (!data || !data.file) return res.status(404).json({ error: "File metadata not found" });

        // One-time use token
        downloadTokens.delete(token);

        console.log(`Downloading tactical file: ${cid}`);
        const encryptedBuffer = await downloadFromPinata(cid);

        const decrypted = decryptFile(
            encryptedBuffer,
            data.file.encryptionKey,
            data.file.iv,
            data.file.tag
        );

        res.setHeader("Content-Disposition", `attachment; filename="${data.file.fileName}"`);
        res.setHeader("Content-Type", data.file.fileType || "application/octet-stream");
        res.setHeader("Content-Length", decrypted.length);
        res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
        res.send(decrypted);

    } catch (err) {
        console.error("Tactical download error:", err);
        res.status(500).json({ error: "Failed to download file: " + err.message });
    }
};

export const getTacticalFileMeta = async (req, res) => {
    try {
        const { cid } = req.params;
        const data = await getFileOwner(cid);
        if (!data || !data.file) return res.status(404).json({ error: "File not found" });

        const ownerRef = { emailMasked: null, phoneMasked: null };
        if (data.owner && data.owner.email) {
            ownerRef.emailMasked = data.owner.email.replace(/(.{2})(.*)(@.*)/, "$1***$3");
        }
        if (data.owner && data.owner.phoneNumber) {
            ownerRef.phoneMasked = data.owner.phoneNumber.slice(0, 4) + '****' + data.owner.phoneNumber.slice(-2);
        }

        res.json({
            fileName: data.file.fileName,
            size: data.file.fileSize,
            accessLevel: data.file.accessLevel || 'private',
            owner: ownerRef
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
