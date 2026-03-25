import dotenv from "dotenv";

// Load environment variables FIRST before anything else
dotenv.config();

import app from "./app.js";
import "./config/db.js";

const PORT = process.env.PORT || 5001;


import { WebSocketServer } from 'ws';

const server = app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

// --- WebSocket Server for Real-Time Events ---
const wss = new WebSocketServer({ server });

// Map to track clients by type (scan, ai)
const clients = { scan: new Set(), ai: new Set() };

wss.on('connection', (ws, req) => {
  // Parse type from query (?type=scan or ?type=ai)
  const url = new URL(req.url, `http://${req.headers.host}`);
  const type = url.searchParams.get('type');
  if (type === 'scan') clients.scan.add(ws);
  else if (type === 'ai') clients.ai.add(ws);
  else ws.close();

  ws.on('close', () => {
    if (type === 'scan') clients.scan.delete(ws);
    if (type === 'ai') clients.ai.delete(ws);
  });
});

// Export a function to broadcast scan/AI events
export function broadcastScanProgress(data) {
  for (const ws of clients.scan) {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(data));
  }
}
export function broadcastAIReply(data) {
  for (const ws of clients.ai) {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(data));
  }
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
  });
});

