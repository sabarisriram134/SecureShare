import db from "../config/db.js";
import crypto from "crypto";

const userSchema = new db.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      match: /^\+?[1-9]\d{1,14}$/
    },
    passwordHash: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(16).toString("hex")
    },
    apiKey: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(32).toString("hex")
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    accountLockedUntil: {
      type: Date,
      default: null
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    files: [
      {
        fileName: String,
        cid: String,
        encryptionKey: String,
        iv: String,
        tag: String,
        fileType: String,
        fileSize: Number,
        uploadedAt: { type: Date, default: Date.now },
        moduleType: {
          type: String,
          enum: ["document", "video", "file", "tactical"],
          default: "file"
        },
        accessLevel: {
          type: String,
          enum: ["public", "private", "restricted"],
          default: "private"
        }
      }
    ],
    accessGrants: [
      {
        grantedTo: String,
        fileId: String,
        grantedAt: { type: Date, default: Date.now }
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default db.model("User", userSchema);
