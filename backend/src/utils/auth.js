import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId, username, apiKey) {
  return jwt.sign(
    { userId, username, apiKey, iat: Date.now() },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.substring(7);
}

// Enhanced security functions
export function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push("Password must be at least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("Password must contain uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("Password must contain lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("Password must contain number");
  if (!/[!@#$%^&*]/.test(password)) errors.push("Password must contain special character (!@#$%^&*)");
  return { valid: errors.length === 0, errors };
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function checkAccountLock(user) {
  if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
    const remainingTime = Math.ceil((user.accountLockedUntil - new Date()) / 1000);
    return { locked: true, remainingTime };
  }
  return { locked: false };
}

export async function recordFailedLogin(user) {
  user.failedLoginAttempts += 1;
  if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
    user.accountLockedUntil = new Date(Date.now() + LOCK_TIME);
  }
  await user.save();
}

export async function resetLoginAttempts(user) {
  user.failedLoginAttempts = 0;
  user.accountLockedUntil = null;
  await user.save();
}

export function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateApiKey() {
  return crypto.randomBytes(32).toString("hex");
}
