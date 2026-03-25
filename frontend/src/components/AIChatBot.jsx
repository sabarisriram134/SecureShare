import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import aiService from '../services/ai.service';
import './AIChatBox.css';

const STORAGE_KEY = 'ai_chat_messages_v1';

const AIChatBox = () => {
  const { user } = useAuth();
  
  // All state hooks MUST be unconditional
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [scanProgress, setScanProgress] = useState(null);

  // All refs MUST be unconditional
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Clear messages when user logs out
  useEffect(() => {
    if (!user) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
      setIsOpen(false);
    }
  }, [user]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => { 
      if (e.key === 'Escape') setIsOpen(false); 
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Send message callback - UNCONDITIONAL
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiService.chat(userMessage.text);
      const aiMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: response?.message || 'I am not sure how to respond to that.',
        intent: response?.intent,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: '⚠️ Something went wrong. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  // Listen for scan progress events
  useEffect(() => {
    if (!isOpen) return;
    const ws = aiService.connectScanProgress((data) => {
      setScanProgress(data);
    });
    return () => ws && ws.close();
  }, [isOpen]);

  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setScanProgress({ stage: 'init', progress: 0 });
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Add user message about scanning
      const userMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        text: `🔍 Scan file for malware: ${file.name}`,
        timestamp: new Date().toISOString(),
        fileUpload: true
      };
      setMessages(prev => [...prev, userMessage]);

      // Send to malware scan endpoint
      console.log('📤 Uploading file for scanning:', file.name);
      const response = await fetch('/api/malware/quick-analysis', {
        method: 'POST',
        body: formData
      });

      console.log('📥 Scan response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📊 Scan result:', result);

      if (result.success) {
        setScanProgress({ stage: 'done', progress: 100 });
        const scanData = result.data;
        
        // Format response with Deep Learning analysis
        let responseText = '';
        if (scanData.safe) {
          responseText = `✅ **File Scan Result: SAFE**\n\n`;
          responseText += `📄 **File:** ${scanData.fileName}\n`;
          responseText += `🎯 **Risk Level:** ${scanData.riskLevel}\n`;
          responseText += `✓ No malware detected\n\n`;
        } else {
          responseText = `⚠️ **File Scan Result: THREATS DETECTED**\n\n`;
          responseText += `📄 **File:** ${scanData.fileName}\n`;
          responseText += `🚨 **Risk Level:** ${scanData.riskLevel}\n`;
          responseText += `⚠️ **Threats Found:** ${scanData.threatCount}\n\n`;
          responseText += `**Detected Issues:**\n`;
          scanData.threats?.forEach(threat => {
            responseText += `• ${threat}\n`;
          });
          responseText += `\n`;
        }

        // Include Deep Learning Analysis if available
        if (scanData.deepLearningAnalysis) {
          responseText += `**🤖 Deep Learning Analysis:**\n`;
          const dlAnalysis = scanData.deepLearningAnalysis;
          responseText += `• Method: ${dlAnalysis.method || 'Neural Network Binary Classification'}\n`;
          if (dlAnalysis.threatScore !== undefined) {
            responseText += `• Threat Score: ${dlAnalysis.threatScore}%\n`;
          }
          if (dlAnalysis.confidence !== undefined) {
            responseText += `• Confidence: ${(dlAnalysis.confidence * 100).toFixed(2)}%\n`;
          }
          responseText += `\n`;
        }

        // Include Behavioral Patterns if available
        if (scanData.behavioralPatterns) {
          responseText += `**🔍 Behavioral Patterns Detected:**\n`;
          const patterns = scanData.behavioralPatterns;
          if (patterns.apiPatterns) {
            responseText += `• API Calls: ${patterns.apiPatterns.networkCalls} network, ${patterns.apiPatterns.registryAccess} registry\n`;
          }
          if (patterns.commandPatterns) {
            responseText += `• Command Patterns: ${patterns.commandPatterns.cmd} cmd executions\n`;
          }
          if (patterns.riskLevel) {
            responseText += `• Risk Level: ${patterns.riskLevel}\n`;
          }
          responseText += `\n`;
        }

        responseText += `**Recommendations:**\n`;
        scanData.recommendations?.forEach(rec => {
          responseText += `• ${rec}\n`;
        });

        const aiMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: responseText,
          intent: 'MALWARE_SCAN_RESULT',
          scanResult: scanData,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(result.message || 'Scan failed');
      }
    } catch (error) {
      console.error('❌ Scan error:', error);
      const errorMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: `❌ Scan failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setUploadingFile(false);
      setTimeout(() => setScanProgress(null), 1500);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm("Clear all chat history?")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Conditional rendering instead of early return (to maintain hook order)
  if (!user) {
    return null; // Safe to return null only after all hooks have been called
  }

  return (
    <div className={`ai-chat-box ${isOpen ? 'open' : 'closed'}`}>
      {!isOpen && (
        <button className="chat-toggle" onClick={() => setIsOpen(true)} aria-label="Open AI Assistant">
          <span className="chat-icon-wrapper">
            <span className="chat-icon">💬</span>
            {messages.length > 0 && <span className="pulse"></span>}
          </span>
        </button>
      )}

      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <div className="header-left">
              <span className="ai-avatar">🤖</span>
              <div className="header-info">
                <h3>AI Assistant</h3>
                <span className="status-indicator">● Online</span>
              </div>
            </div>
            <div className="header-actions">
              <button onClick={clearChat} title="Clear chat" className="action-btn">
                🗑
              </button>
              <button onClick={() => setIsOpen(false)} title="Close" className="action-btn">
                ✕
              </button>
            </div>
          </div>

          <div className="messages-container" aria-live="polite">
            {scanProgress && (
              <div className="scan-progress-bar">
                <div className="scan-progress-label">
                  {scanProgress.stage === 'done' ? 'Scan Complete' : `Scanning: ${scanProgress.stage}`}
                </div>
                <div className="scan-progress-track">
                  <div className="scan-progress-fill" style={{ width: `${scanProgress.progress || 0}%` }}></div>
                </div>
              </div>
            )}
            {messages.length === 0 && (
              <div className="welcome-message">
                <div className="welcome-icon">✨</div>
                <p className="welcome-title">Hi there!</p>
                <p className="welcome-subtitle">How can I assist you today?</p>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.role} ${msg.intent || ''}`}>
                <div className="message-wrapper">
                  <div className="message-content">
                    {msg.text}
                  </div>
                  <span className="timestamp">{formatTime(msg.timestamp)}</span>
                </div>
                {msg.intent && <span className="intent-tag">{msg.intent}</span>}
              </div>
            ))}
            {isLoading && (
              <div className="message assistant typing">
                <div className="typing-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-form">
            <div className="input-wrapper">
              <input 
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                disabled={uploadingFile || isLoading}
                style={{ display: 'none' }}
                aria-label="Upload file for scanning"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile || isLoading}
                className="file-upload-btn"
                title="Upload file for malware scanning"
              >
                {uploadingFile ? '📤' : '📎'}
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message or upload file to scan..."
                disabled={isLoading}
                rows={1}
                aria-label="Chat input"
              />
              <button 
                onClick={handleSendMessage} 
                disabled={isLoading || !input.trim()}
                className="send-btn"
                title="Send message"
              >
                {isLoading ? '⏳' : '➤'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatBox;