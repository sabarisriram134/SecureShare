import React, { useState } from "react";
import api from "../services/api.js";

export default function UploadPage() {
  const [text, setText] = useState("");
  const [cid, setCid] = useState(null);
  const [key, setKey] = useState(null);

  const upload = async () => {
    try {
      const res = await api.post("/files/upload", {
        fileName: "demo.txt",
        fileContent: text
      });
      setCid(res.data.cid);
      setKey(res.data.key);
      alert(`Uploaded. CID: ${res.data.cid}\nAES Key: ${res.data.key}`);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} cols={60} />
      <br />
      <button onClick={upload}>Upload</button>
      {cid && (
        <div style={{ marginTop: 10 }}>
          <p><strong>CID:</strong> {cid}</p>
          <p><strong>Key:</strong> {key}</p>
        </div>
      )}
    </div>
  );
}
