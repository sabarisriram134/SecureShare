import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOCK_STORAGE_DIR = path.join(__dirname, "../../.mock-storage");

// Ensure storage directory exists
if (!fs.existsSync(MOCK_STORAGE_DIR)) {
  fs.mkdirSync(MOCK_STORAGE_DIR, { recursive: true });
}

const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs";

const uploadToPinata = async (jsonPayload) => {
  if (!process.env.PINATA_JWT) {
    // Mock fallback for college demo - store on disk
    const cid = "MOCK_CID_" + Date.now();
    const filePath = path.join(MOCK_STORAGE_DIR, `${cid}.bin`);
    
    // Store as buffer
    const buffer = Buffer.isBuffer(jsonPayload.encrypted) 
      ? jsonPayload.encrypted 
      : Buffer.from(jsonPayload.encrypted, "hex");
    
    fs.writeFileSync(filePath, buffer);
    console.log(`Mock upload stored: ${cid}`);
    return cid;
  }

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    jsonPayload,
    { headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` } }
  );
  return res.data.IpfsHash;
};

const downloadFromPinata = async (cid) => {
  if (cid.startsWith("MOCK_CID_")) {
    // Return stored mock data from disk
    const filePath = path.join(MOCK_STORAGE_DIR, `${cid}.bin`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Mock file not found: ${cid}`);
    }
    return fs.readFileSync(filePath);
  }

  const url = `${PINATA_GATEWAY}/${cid}`;
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(res.data);
};

export { uploadToPinata, downloadFromPinata };
