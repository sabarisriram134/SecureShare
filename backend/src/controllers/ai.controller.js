/**
 * AI Controller
 * Handles AI Assistant API requests
 */

import aiService from '../services/ai.service.js';

// Chat with AI Assistant
export const chat = async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    const userId = req.user?.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty' });
    }

    const response = await aiService.processQuery(message, userId, context);
    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Error processing AI query:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Parse user intent
export const parseIntent = async (req, res) => {
  try {
    const { query } = req.body;
    const intent = await aiService.parseIntent(query);
    res.json({ success: true, data: intent });
  } catch (error) {
    console.error('Error parsing intent:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get AI suggestions
export const getSuggestions = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { context = 'general' } = req.query;
    const suggestions = await aiService.generateSuggestions(userId, context);
    res.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Execute AI command
export const executeCommand = async (req, res) => {
  try {
    const { command, params = {} } = req.body;
    const userId = req.user?.id;

    const result = await aiService.executeCommand(command, params, userId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error executing AI command:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get conversation history
export const getHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { limit = 50 } = req.query;
    const history = await aiService.getConversationHistory(userId, limit);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export default { chat, parseIntent, getSuggestions, executeCommand, getHistory };
