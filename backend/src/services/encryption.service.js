// Handles AES-GCM encryption + ECIES-like key wrapping (demo version)
import crypto from "crypto";

// AES-GCM encrypt
function encryptAES(plainText, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(key, "hex"), iv);
  
  // Handle both Buffer and string input
  const input = Buffer.isBuffer(plainText) ? plainText : Buffer.from(plainText, "utf8");
  
  let encrypted = cipher.update(input).toString("hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return { encrypted, iv: iv.toString("hex"), tag };
}

// AES-GCM decrypt - handles both hex strings and buffers
function decryptAES(encrypted, key, ivHex, tagHex) {
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(key, "hex"), iv);
  decipher.setAuthTag(tag);
  
  // Handle both hex string and Buffer input
  const encryptedBuffer = Buffer.isBuffer(encrypted) ? encrypted : Buffer.from(encrypted, "hex");
  
  let decrypted = decipher.update(encryptedBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted;
}

// Convenience function for frontend integration
export const encryptFile = (fileContent) => {
  const key = crypto.randomBytes(32).toString("hex");
  const { encrypted, iv, tag } = encryptAES(fileContent, key);
  return { encrypted, key, iv, tag };
};

export const decryptFile = (encrypted, key, iv, tag) => {
  return decryptAES(encrypted, key, iv, tag);
};

export { encryptAES, decryptAES };

