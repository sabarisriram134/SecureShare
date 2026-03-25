/**
 * useAI Hook
 * Custom hook for AI functionality
 */

import { useState, useCallback } from 'react';
import aiService from '../services/ai.service';

export const useAI = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIntent, setCurrentIntent] = useState(null);

  // Send message to AI
  const sendMessage = useCallback(async (message, context = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await aiService.chat(message, context);

      setMessages(prev => [...prev, {
        role: 'user',
        text: message,
        timestamp: new Date()
      }]);

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: response.message,
        intent: response.intent,
        timestamp: new Date()
      }]);

      setCurrentIntent(response.intent);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // Get suggestions
  const getSuggestions = useCallback(async (context = 'general') => {
    try {
      setLoading(true);
      const suggestions = await aiService.getSuggestions(context);
      return suggestions;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Execute command
  const executeCommand = useCallback(async (command, params = {}) => {
    try {
      setLoading(true);
      const result = await aiService.executeCommand(command, params);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    messages,
    loading,
    error,
    currentIntent,
    sendMessage,
    clearMessages,
    getSuggestions,
    executeCommand
  };
};

export default useAI;
