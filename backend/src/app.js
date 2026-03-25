import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import fileRoutes from "./routes/file.routes.js";
import accessRoutes from "./routes/access.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import authRoutes from "./routes/auth.routes.js";
import reportRoutes from "./routes/report.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import malwareRoutes from "./routes/malware.routes.js";
import tacticalRoutes from "./routes/tactical.routes.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:3000"],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests, please try again later"
});
app.use(limiter);

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "SecureShare Backend Running" });
});

// Auth routes (no auth required - before auth middleware)
app.use("/auth", authRoutes);

// Malware routes (no auth required for file scanning from chatbot)
app.use("/api/malware", malwareRoutes);

// Tactical share public access
app.use("/api/tactical", tacticalRoutes);

// Protected routes (auth middleware)
app.use(authMiddleware);
app.use("/files", fileRoutes);
app.use("/access", accessRoutes);
app.use("/audit", auditRoutes);
app.use("/reports", reportRoutes);
app.use("/admin", adminRoutes);
app.use("/ai", aiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('=== UNHANDLED ERROR ===');
  console.error('Method:', req.method);
  console.error('URL:', req.url);
  console.error('Error Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('Body:', req.body);
  console.error('========================');

  // Don't expose sensitive error details to client
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
