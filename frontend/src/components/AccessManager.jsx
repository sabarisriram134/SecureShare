import React, { useState } from "react";
import api from "../services/api.js";
import { useWallet } from "../context/WalletContext.jsx";

export default function AccessManager({ cid }) {
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState(null);
  const { account } = useWallet();

  const grant = async () => {
    if (!recipient) return alert("Enter recipient address");
    try {
      const res = await api.post("/access/grant", { cid, wallet: recipient, owner: account });
      setStatus({ ok: true, tx: res.data.txHash || res.data.tx });
      alert("Access granted");
    } catch (err) {
      console.error(err);
      setStatus({ ok: false });
      alert("Grant failed");
    }
  };

  return (
    <div style={{ marginTop:12 }}>
      <input placeholder="Recipient address" value={recipient} onChange={(e) => setRecipient(e.target.value)} style={{ padding:8, width:320 }} />
      <button onClick={grant} style={{ marginLeft:8 }}>Grant Access</button>
      {status && (status.ok ? <p className="small">Granted (tx: {status.tx})</p> : <p className="small">Failed</p>)}
    </div>
  );
}
