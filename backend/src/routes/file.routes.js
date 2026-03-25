import express from "express";
import multer from "multer";
import fileController from "../controllers/file.controller.js";
import authMiddleware from "../middlewares/authmiddleware.js";

const router = express.Router();

// Configure multer for in-memory file upload (200MB max for videos)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
  fileFilter: (req, file, cb) => {
    // Allow common file types and video formats
    const allowedMimes = [
      "application/pdf",
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/zip",
      "application/x-rar-compressed",
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-msvideo",
      // Additional common types that might not be recognized
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/x-msdownload",
      "application/octet-stream"
    ];
    // Log file type for debugging
    console.log(`Upload attempt - File: ${file.originalname}, MIME: ${file.mimetype}`);

    if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('application/') || file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

// Upload a new file with error handling
router.post("/upload", authMiddleware, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err.message);
      return res.status(400).json({ error: "Upload error: " + err.message });
    }
    fileController.uploadFile(req, res);
  });
});

// Get all files (for dashboard)
router.get("/", authMiddleware, fileController.getAllFiles);

// Download file by CID
router.get("/download/:cid", authMiddleware, fileController.downloadFile);

// Get metadata for a file
router.get("/meta/:cid", authMiddleware, fileController.getFileMeta);

export default router;

