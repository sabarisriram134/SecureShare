import { encryptFile, decryptFile } from "../services/encryption.service.js";
import { uploadToPinata, downloadFromPinata } from "../config/ipfs.js";
import User from "../models/User.js";

// ── Controllers ──────────────────────────────────────────────────────────────

const getAllFiles = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const files = user.files.map((f) => ({
      fileName: f.fileName,
      cid: f.cid,
      fileType: f.fileType,
      fileSize: f.fileSize,
      moduleType: f.moduleType,
      accessLevel: f.accessLevel || 'private',
      uploadedAt: f.uploadedAt
    }));

    res.json({ files, total: files.length });
  } catch (err) {
    console.error("Get files error:", err);
    res.status(500).json({ error: err.message });
  }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      console.error("[Upload] No file received in request");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileName = req.file.originalname;
    const fileBuffer = req.file.buffer;
    const userId = req.user?.userId;
    const moduleType = req.body.moduleType || "file";
    const accessLevel = req.body.accessLevel || "private";

    if (!userId) {
      console.error("[Upload] No user ID - authentication failed");
      return res.status(401).json({ error: "User not authenticated" });
    }

    console.log(`[Upload] Processing: ${fileName} (${fileBuffer.length} bytes) for user ${userId} with access ${accessLevel}`);

    // Encrypt the file buffer
    console.log(`[Upload] Starting encryption...`);
    const { encrypted, key, iv, tag } = encryptFile(fileBuffer);
    console.log(`[Upload] Encryption complete - encrypted size: ${encrypted.length} bytes`);

    // Upload encrypted file to IPFS
    console.log(`[Upload] Uploading to IPFS...`);
    const cid = await uploadToPinata({ fileName, encrypted });
    console.log(`[Upload] IPFS upload successful: CID=${cid}`);

    const fileRecord = {
      fileName,
      cid,
      encryptionKey: key,
      iv,
      tag,
      fileType: req.file.mimetype,
      fileSize: fileBuffer.length,
      moduleType,
      accessLevel,
      uploadedAt: new Date(),
      userId
    };

    console.log(`[Upload] Saving file record to database...`);
    const user = await User.findById(userId);
    if (!user) {
      console.error(`[Upload] User not found in database: ${userId}`);
      return res.status(404).json({ error: "User not found" });
    }
    
    user.files.push(fileRecord);
    await user.save();
    console.log(`[Upload] File record saved successfully`);

    const response = {
      cid,
      key,
      iv,
      tag,
      fileName,
      fileSize: fileBuffer.length,
      message: "File uploaded and encrypted successfully"
    };

    console.log(`[Upload] Sending response to client`);
    res.json(response);

  } catch (err) {
    console.error("[Upload] Critical error:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    res.status(500).json({ error: err.message || "Upload failed" });
  }
};

const downloadFile = async (req, res) => {
  try {
    const { cid } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    let fileMetadata;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    fileMetadata = user.files.find((f) => f.cid === cid);

    if (!fileMetadata) {
      return res.status(404).json({ error: "File not found in your account" });
    }

    console.log(`Downloading file: ${cid} for user ${userId}`);

    const encryptedBuffer = await downloadFromPinata(cid);
    console.log(`Downloaded encrypted buffer: ${encryptedBuffer.length} bytes`);

    const decrypted = decryptFile(
      encryptedBuffer,
      fileMetadata.encryptionKey,
      fileMetadata.iv,
      fileMetadata.tag
    );

    console.log(`Decrypted file: ${decrypted.length} bytes`);

    res.setHeader("Content-Disposition", `attachment; filename="${fileMetadata.fileName}"`);
    res.setHeader("Content-Type", fileMetadata.fileType || "application/octet-stream");
    res.setHeader("Content-Length", decrypted.length);
    res.send(decrypted);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getFileMeta = async (req, res) => {
  try {
    const { cid } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    let fileMetadata;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    fileMetadata = user.files.find((f) => f.cid === cid);

    if (!fileMetadata) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json({
      fileName: fileMetadata.fileName,
      cid: fileMetadata.cid,
      fileType: fileMetadata.fileType,
      fileSize: fileMetadata.fileSize,
      moduleType: fileMetadata.moduleType,
      accessLevel: fileMetadata.accessLevel || 'private',
      uploadedAt: fileMetadata.uploadedAt
    });
  } catch (err) {
    console.error("Get metadata error:", err);
    res.status(500).json({ error: err.message });
  }
};

export default {
  uploadFile,
  getAllFiles,
  downloadFile,
  getFileMeta
};
