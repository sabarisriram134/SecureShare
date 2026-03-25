import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { fetchFromIPFS } from "../services/ipfs-fetch";
import { decryptAES } from "../services/encryption";
import AccessManager from "../components/AccessManager";

export default function FileDetail() {
  const { cid } = useParams();
  const [fileData, setFileData] = useState("");
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);

  const loadFile = async () => {
    try {
      // Load metadata from backend
      const metaRes = await api.get(`http://localhost:5000/files/meta/${cid}`);
      setMeta(metaRes.data);

      // Fetch encrypted data from IPFS
      const encrypted = await fetchFromIPFS(cid);

      // Decrypt using AES key stored from backend metadata
      const decrypted = decryptAES(encrypted, metaRes.data.key);
      setFileData(decrypted);
    } catch (err) {
      console.error("Error loading file:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFile();
  }, [cid]);

  if (loading) return <h2>Loading file…</h2>;

  return (
    <div style={{ padding: 20 }}>
      <h1>File Details</h1>

      <h3>Filename: {meta.fileName}</h3>
      <p><strong>CID:</strong> {cid}</p>

      <h2>📄 Decrypted Content:</h2>
      <pre style={{ background: "#f4f4f4", padding: 20, whiteSpace: "pre-wrap" }}>
        {fileData}
      </pre>

      <h2>🔐 Manage Access</h2>
      <AccessManager cid={cid} />
    </div>
  );
}
