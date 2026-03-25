import { useState } from "react";
import api from "../services/api";
import { fetchFromIPFS } from "../services/ipfs-fetch";
import { decryptAES } from "../services/encryption";

export default function useFileManager() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Upload file → backend → encrypt → upload to IPFS
   */
  const uploadFile = async (fileName, fileText) => {
    setLoading(true);
    setError("");

    try {
      const res = await api.post("http://localhost:5000/files/upload", {
        fileName,
        fileData: fileText
      });

      return res.data; // { cid, key, fileName }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload file");
    }

    setLoading(false);
  };

  /**
   * Load all files for dashboard
   */
  const loadFiles = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("http://localhost:5000/files");
      setFiles(res.data.files || []);
    } catch (err) {
      console.error("Load files error:", err);
      setError("Failed to load files");
    }

    setLoading(false);
  };

  /**
   * Fetch + decrypt file
   */
  const loadAndDecryptFile = async (cid) => {
    setLoading(true);
    setError("");

    try {
      // get metadata + AES key
      const metaRes = await api.get(`http://localhost:5000/files/meta/${cid}`);
      const meta = metaRes.data;

      // get encrypted file from IPFS
      const encrypted = await fetchFromIPFS(cid);

      // decrypt using AES key
      const decrypted = decryptAES(encrypted, meta.key);

      setLoading(false);
      return { meta, decrypted };

    } catch (err) {
      console.error("Decrypt file error:", err);
      setError("Failed to load or decrypt file");
      setLoading(false);
    }
  };

  return {
    files,
    loading,
    error,
    uploadFile,
    loadFiles,
    loadAndDecryptFile
  };
}
