import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAuditLogs = async () => {
    try {
      const res = await api.get("http://localhost:5000/audit");
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error("Error loading audit logs:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  if (loading) return <h2>Loading audit logs…</h2>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Audit Log</h1>
      <p>All user actions recorded by backend</p>

      {logs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <ul>
          {logs.map((log, i) => (
            <li key={i}>
              <strong>{log.action}</strong> — {log.fileCid}  
              <br />
              <small>{new Date(log.timestamp).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
