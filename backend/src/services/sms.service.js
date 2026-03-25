import twilio from "twilio";
import crypto from "crypto";

// Store temporary SMS codes in memory (in production, use Redis or DB)
const smsCodes = new Map();

let client = null;
let isInitializing = false;

function initializeTwilio() {
    if (isInitializing) return client;
    if (client) return client;

    isInitializing = true;
    try {
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            console.log("✓ Twilio initialized");
            client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        } else {
            console.log("ℹ️  Twilio not configured. SMS will be simulated in console.");
        }
        return client;
    } finally {
        isInitializing = false;
    }
}

// Generate a random 6-digit access code (reused logic)
export function generateSMSCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send SMS code
export async function sendSMSCode(phoneNumber, cid) {
    try {
        initializeTwilio();

        const code = generateSMSCode();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry for SMS

        // Store the code
        const codeKey = `${phoneNumber}:${cid}`;
        smsCodes.set(codeKey, {
            code,
            expiresAt,
            attempts: 0,
            cid
        });

        const messageBody = `Your SecureShare Tactical authorization code is: ${code}. It expires in 5 minutes. DO NOT SHARE THIS CODE.`;

        if (client && process.env.TWILIO_PHONE_NUMBER) {
            await client.messages.create({
                body: messageBody,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phoneNumber
            });
            console.log(`✓ SMS code sent to ${phoneNumber}`);
        } else {
            // Simulate SMS
            console.log(`[SIMULATED SMS to ${phoneNumber}]: ${messageBody}`);
        }

        return { success: true, expiresIn: 300 }; // 5 mins
    } catch (err) {
        console.error("SMS send error:", err);
        throw new Error("Failed to send SMS code: " + err.message);
    }
}

// Verify SMS code
export function verifySMSCode(phoneNumber, cid, code) {
    const codeKey = `${phoneNumber}:${cid}`;
    const stored = smsCodes.get(codeKey);

    if (!stored) {
        return { valid: false, message: "No SMS code found or expired" };
    }

    // Check expiry
    if (Date.now() > stored.expiresAt) {
        smsCodes.delete(codeKey);
        return { valid: false, message: "SMS code has expired" };
    }

    // Check attempts (max 5)
    if (stored.attempts >= 5) {
        smsCodes.delete(codeKey);
        return { valid: false, message: "Too many failed attempts. Request a new code." };
    }

    // Verify
    if (stored.code !== code) {
        stored.attempts += 1;
        return { valid: false, message: `Invalid SMS code. ${5 - stored.attempts} attempts remaining.` };
    }

    // Code is valid
    smsCodes.delete(codeKey);
    return { valid: true, message: "SMS Verified" };
}

// Auto cleanup
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of smsCodes.entries()) {
        if (now > value.expiresAt) {
            smsCodes.delete(key);
        }
    }
}, 60000); // Every minute
