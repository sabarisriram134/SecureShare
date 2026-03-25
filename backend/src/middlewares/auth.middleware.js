import { verifyToken, extractToken } from "../utils/auth.js";

export function authMiddleware(req, res, next) {
  const token = extractToken(req);
  
  // For now, demo mode - allow requests without token
  if (!token) {
    console.log("No auth token provided - demo mode");
    req.user = { userId: "demo", username: "demo-user" };
    return next();
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  req.user = decoded;
  next();
}
