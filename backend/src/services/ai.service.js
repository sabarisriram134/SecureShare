/**
 * AI Service
 * Handles AI processing, intent parsing, and command execution
 */

import intentParser from '../ai/intent.parser.js';
import rulesEngine from '../ai/rules.engine.js';
import Conversation from '../models/Conversation.js';
import crypto from 'crypto';

class AIService {
  // Process user query and save to conversation history
  async processQuery(message, userId, context = {}) {
    try {
      // Parse intent
      const intent = await intentParser.parse(message);

      // Generate response based on intent
      const response = await rulesEngine.generateResponse(intent, context);

      // Create user message
      const userMessage = {
        id: crypto.randomUUID(),
        sender: 'user',
        text: message,
        intent: 'USER_INPUT',
        timestamp: new Date()
      };

      // Create assistant message
      const assistantMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: response,
        intent: intent.type,
        confidence: intent.confidence,
        entities: intent.entities,
        timestamp: new Date()
      };

      // Save to conversation history
      if (userId) {
        await this.saveToConversation(userId, userMessage, assistantMessage, intent.type);
      }

      console.log('AI query processed', { userId, intent: intent.type });

      return {
        message: response,
        intent: intent.type,
        confidence: intent.confidence,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error processing AI query:', error);
      throw error;
    }
  }

  // Save messages to conversation history
  async saveToConversation(userId, userMessage, assistantMessage, lastIntent) {
    try {
      let conversation = await Conversation.findOne({ userId, isActive: true }).sort({ updatedAt: -1 });

      if (!conversation) {
        // Create new conversation if none exists
        conversation = new Conversation({
          userId,
          messages: [userMessage, assistantMessage],
          lastIntent,
          title: userMessage.text.substring(0, 50) + '...'
        });
      } else {
        // Add to existing conversation
        conversation.messages.push(userMessage, assistantMessage);
        conversation.lastIntent = lastIntent;
        conversation.updatedAt = new Date();
      }

      await conversation.save();
      console.log('Conversation saved', { userId, messageCount: conversation.messages.length });
    } catch (error) {
      console.error('Error saving conversation:', error);
      // Don't throw - continue even if save fails
    }
  }

  // Parse intent
  async parseIntent(query) {
    try {
      return await intentParser.parse(query);
    } catch (error) {
      console.error('Error parsing intent:', error);
      throw error;
    }
  }

  // Generate suggestions based on context
  async generateSuggestions(userId, context = 'general') {
    try {
      let suggestions = [];

      if (context === 'general') {
        suggestions = [
          { id: 1, text: '📁 How do I upload a file?', intent: 'UPLOAD' },
          { id: 2, text: '⬇️ How do I download a file?', intent: 'DOWNLOAD' },
          { id: 3, text: '🔗 How do I share files with others?', intent: 'SHARE' },
          { id: 4, text: '🔍 How do I search for files?', intent: 'SEARCH' },
          { id: 5, text: '🗑️ How do I delete a file?', intent: 'DELETE' },
          { id: 6, text: '❓ What are the main features?', intent: 'HELP' }
        ];
      }

      return suggestions;
    } catch (error) {
      console.error('Error generating suggestions:', error);
      throw error;
    }
  }

  // Execute command
  async executeCommand(command, params = {}, userId) {
    try {
      console.log('Executing AI command', { command, userId });

      const result = await rulesEngine.executeCommand(command, params);

      return {
        command,
        status: 'success',
        result,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error executing command:', error);
      throw error;
    }
  }

  // Get conversation history from database
  async getConversationHistory(userId, limit = 50) {
    try {
      const conversation = await Conversation.findOne({ userId, isActive: true })
        .sort({ updatedAt: -1 })
        .select('messages');

      if (!conversation) {
        return [];
      }

      // Return last N messages
      return conversation.messages.slice(-limit);
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      throw error;
    }
  }

  // Handle malware scan request
  async handleMalwareScanRequest(message, scanResult) {
    try {
      const scanSummary = this.formatScanResult(scanResult);
      
      let response = '';
      
      if (scanResult.status === 'SAFE') {
        response = `✅ **Scan Complete - File is SAFE**\n\n`;
        response += `📄 **File:** ${scanResult.fileName}\n`;
        response += `🔍 **Risk Level:** ${scanResult.riskLevel}\n`;
        response += `✓ No threats detected\n`;
        response += `💾 **File Size:** ${this.formatFileSize(scanResult.fileSize)}\n`;
        response += `🔐 **Hash:** ${scanResult.hash?.substring(0, 16)}...\n\n`;
        response += `**Recommendations:**\n`;
        scanResult.recommendations?.forEach(rec => {
          response += `• ${rec}\n`;
        });
      } else if (scanResult.status === 'THREAT_DETECTED') {
        response = `⚠️ **THREAT DETECTED - Review Required**\n\n`;
        response += `📄 **File:** ${scanResult.fileName}\n`;
        response += `🚨 **Risk Level:** ${scanResult.riskLevel}\n\n`;
        response += `**Detected Threats:**\n`;
        scanResult.threats?.forEach(threat => {
          response += `• ${threat}\n`;
        });
        
        if (scanResult.detectedPatterns?.length > 0) {
          response += `\n**Suspicious Patterns:**\n`;
          scanResult.detectedPatterns.forEach(pattern => {
            response += `• ${pattern.description} (${pattern.risk})\n`;
          });
        }
        
        response += `\n**Recommendations:**\n`;
        scanResult.recommendations?.forEach(rec => {
          response += `• ${rec}\n`;
        });
      } else if (scanResult.status === 'BLOCKED') {
        response = `🚫 **FILE BLOCKED**\n\n`;
        response += `📄 **File:** ${scanResult.fileName}\n`;
        response += `❌ **Reason:** ${scanResult.reason}\n`;
        response += `🔴 **Threat:** ${scanResult.threat}\n\n`;
        response += `This file cannot be uploaded due to security policies.\n\n`;
        response += `**Recommendations:**\n`;
        scanResult.recommendations?.forEach(rec => {
          response += `• ${rec}\n`;
        });
      }

      return {
        message: response,
        intent: 'MALWARE_SCAN_RESULT',
        scanResult: scanSummary,
        actionRequired: scanResult.status !== 'SAFE'
      };
    } catch (error) {
      console.error('Error handling malware scan:', error);
      return {
        message: '⚠️ Error processing file scan. Please try again.',
        intent: 'ERROR',
        error: error.message
      };
    }
  }

  // Format scan result for display
  formatScanResult(result) {
    return {
      scanId: result.scanId,
      fileName: result.fileName,
      status: result.status,
      riskLevel: result.riskLevel,
      threatCount: result.threats?.length || 0,
      isSafe: result.status === 'SAFE',
      isBlocked: result.status === 'BLOCKED'
    };
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export default new AIService();
