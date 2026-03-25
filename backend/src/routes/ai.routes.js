/**
 * AI Routes
 * API endpoints for AI Assistant
 */

import express from 'express';
import aiController from '../controllers/ai.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply auth middleware
router.use(authMiddleware);

// Chat with AI
router.post('/chat', aiController.chat);

// Parse intent
router.post('/parse-intent', aiController.parseIntent);

// Get suggestions
router.get('/suggestions', aiController.getSuggestions);

// Execute command
router.post('/execute-command', aiController.executeCommand);

// Get conversation history
router.get('/history', aiController.getHistory);

export default router;
