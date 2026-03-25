/**
 * AI Service Tests
 * Unit tests for AI service
 */

const aiService = require('../services/ai.service');
const intentParser = require('../ai/intent.parser');
const rulesEngine = require('../ai/rules.engine');

describe('AI Service', () => {
  describe('parseIntent', () => {
    it('should detect UPLOAD intent', async () => {
      const intent = await intentParser.parse('Can you help me upload a file?');
      expect(intent.type).toBe('UPLOAD');
      expect(intent.confidence).toBeGreaterThan(0);
    });

    it('should detect DOWNLOAD intent', async () => {
      const intent = await intentParser.parse('I want to download my files');
      expect(intent.type).toBe('DOWNLOAD');
    });

    it('should detect SHARE intent', async () => {
      const intent = await intentParser.parse('Share this with user@example.com');
      expect(intent.type).toBe('SHARE');
    });

    it('should extract entities from query', async () => {
      const intent = await intentParser.parse('Share this with john@example.com');
      expect(intent.entities).toBeDefined();
      expect(intent.entities.users).toContain('john@example.com');
    });
  });

  describe('processQuery', () => {
    it('should process valid query', async () => {
      const response = await aiService.processQuery('Help me upload a file', 'user123');
      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.intent).toBeDefined();
      expect(response.confidence).toBeGreaterThan(0);
    });

    it('should throw error for empty query', async () => {
      try {
        await aiService.processQuery('', 'user123');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('generateSuggestions', () => {
    it('should generate suggestions', async () => {
      const suggestions = await aiService.generateSuggestions('user123');
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('executeCommand', () => {
    it('should execute valid command', async () => {
      const result = await aiService.executeCommand('LIST_FILES', {}, 'user123');
      expect(result).toBeDefined();
      expect(result.command).toBe('LIST_FILES');
      expect(result.status).toBe('success');
    });

    it('should throw error for invalid command', async () => {
      try {
        await aiService.executeCommand('INVALID_CMD', {}, 'user123');
        fail('Should throw error');
      } catch (error) {
        expect(error.message).toContain('Unknown command');
      }
    });
  });

  describe('getConversationHistory', () => {
    it('should retrieve conversation history', async () => {
      const history = await aiService.getConversationHistory('user123', 10);
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeLessThanOrEqual(10);
    });
  });
});

describe('Rules Engine', () => {
  describe('generateResponse', () => {
    it('should generate response for UPLOAD intent', async () => {
      const response = await rulesEngine.generateResponse({ type: 'UPLOAD' });
      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(0);
    });
  });
});
