/**
 * Frontend AI Service
 * API calls for AI Assistant features + WebSocket helpers
 */

import api from './api';

const aiService = {
  // ── WebSocket: scan progress ──────────────────────────────
  scanProgressSocket: null,
  connectScanProgress(onMessage) {
    if (this.scanProgressSocket) this.scanProgressSocket.close();
    const ws = new window.WebSocket(`ws://${window.location.hostname}:5001/?type=scan`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
    this.scanProgressSocket = ws;
    return ws;
  },

  // ── WebSocket: AI reply streaming ─────────────────────────
  aiReplySocket: null,
  connectAIReply(onMessage) {
    if (this.aiReplySocket) this.aiReplySocket.close();
    const ws = new window.WebSocket(`ws://${window.location.hostname}:5001/?type=ai`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
    this.aiReplySocket = ws;
    return ws;
  },

  // ── REST: Chat with AI ────────────────────────────────────
  async chat(message, context = {}) {
    try {
      const response = await api.post('/ai/chat', { message, context });
      return response.data.data;
    } catch (error) {
      console.error('Error sending message to AI:', error);
      throw error;
    }
  },

  // ── REST: Parse intent ────────────────────────────────────
  async parseIntent(query) {
    try {
      const response = await api.post('/ai/parse-intent', { query });
      return response.data.data;
    } catch (error) {
      console.error('Error parsing intent:', error);
      throw error;
    }
  },

  // ── REST: Get suggestions ─────────────────────────────────
  async getSuggestions(context = 'general') {
    try {
      const response = await api.get('/ai/suggestions', { params: { context } });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      throw error;
    }
  },

  // ── REST: Execute command ─────────────────────────────────
  async executeCommand(command, params = {}) {
    try {
      const response = await api.post('/ai/execute-command', { command, params });
      return response.data.data;
    } catch (error) {
      console.error('Error executing command:', error);
      throw error;
    }
  },

  // ── REST: Get conversation history ────────────────────────
  async getHistory(limit = 50) {
    try {
      const response = await api.get('/ai/history', { params: { limit } });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      throw error;
    }
  },
};

export default aiService;
