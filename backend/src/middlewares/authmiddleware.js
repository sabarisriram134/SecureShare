import jwt from "jsonwebtoken";

// Replace with your secret or load from env
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  
  // Require token for protected routes
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization token provided" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid token format. Use: Bearer <token>" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded payload to request
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export default authMiddleware;


