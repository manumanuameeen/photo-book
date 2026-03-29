import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, 
  Loader2, RotateCcw, AlertCircle 
} from 'lucide-react';
import { useAuthStore } from '../../modules/auth/store/useAuthStore';
import { PhotographerList, PackageList, BookingConfirmation, AvailabilityPicker } from './ChatRenderers';
import type { PhotographerData, PackageData, AvailabilityData } from './ChatRenderers';
import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from "../../constants/routes";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  structuredData?: {
    type: 'photographer_list' | 'package_list' | 'booking_confirmation' | 'availability_picker';
    photographerId?: string;
    data?: PhotographerData[] | PackageData[] | AvailabilityData;
    bookingId?: string;
  };
  timestamp?: Date;
}

interface ChatbotApiResponse {
  success: boolean;
  message: string;
  structuredData?: {
    type: 'photographer_list' | 'package_list' | 'booking_confirmation' | 'availability_picker';
    photographerId?: string;
    data?: PhotographerData[] | PackageData[] | AvailabilityData;
    bookingId?: string;
  };
  conversationPhase?: string;
}

interface HistoryApiResponse {
  success: boolean;
  messages: Message[];
}

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Hi there! I\'m Shutter, your Photo-book booking assistant. I can help you find photographers and book sessions. What type of photography are you looking for today?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => `session_${Math.random().toString(36).substring(2, 11)}`);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || 
    (globalThis.location.hostname === "localhost" 
      ? "http://localhost:5000/api/v1" 
      : "/api/v1");

  /**
   * Load conversation history from backend
   * This preserves context across sessions
   */
  const loadChatHistory = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setError(null);
      const response = await fetch(
        `${apiUrl}/ai/chatbot/history?sessionId=${sessionId}`, 
        { credentials: 'include' }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: HistoryApiResponse = await response.json();
      
      if (data.success && data.messages.length > 0) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Could not load chat history');
    }
  }, [apiUrl, sessionId, isAuthenticated]);

  // Load history when chat opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadChatHistory();
    }
  }, [isOpen, isAuthenticated, loadChatHistory]);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  /**
   * Send message to chatbot backend
   * No more parsing markdown JSON blocks - backend returns clean structured data
   */
  const handleSendMessage = useCallback(async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: textToSend,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/ai/chatbot`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          sessionId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ChatbotApiResponse = await response.json();

      if (data.success) {
        // Backend now returns clean message and separate structuredData
        // No need to parse embedded JSON anymore!
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message,
          structuredData: data.structuredData,
          timestamp: new Date(),
        }]);

      } else {
        throw new Error(data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      setError(errorMessage);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, input, isLoading, messages, sessionId]);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Handle photographer selection from list
   */
  const onSelectPhotographer = (photographer: PhotographerData) => {
    const id = photographer._id;
    const name = photographer.businessInfo?.businessName || photographer.personalInfo?.name;
    handleSendMessage(
      `I'm interested in ${name}. Can you show me their packages? (ID: ${id})`
    );
  };

  /**
   * Handle package selection
   * Routes to booking wizard if possible, otherwise continues chat flow
   */
  const onSelectPackage = (pkg: PackageData, photographerId?: string) => {
    if (photographerId) {
      // Direct route to booking wizard
      navigate({ 
        to: ROUTES.USER.BOOKING, 
        search: { photographerId, packageId: pkg._id } 
      });
      setIsOpen(false);
    } else {
      // Continue in chat
      handleSendMessage(
        `I'd like to book the "${pkg.name}" package. What information do you need from me? (Package ID: ${pkg._id})`
      );
    }
  };

  /**
   * Handle availability selection
   */
  const onSelectAvailability = (date: string, time: string) => {
    handleSendMessage(`I'd like to book for ${date} at ${time}.`);
  };

  /**
   * Reset conversation
   */
  const handleReset = () => {
    setMessages([{
      role: 'assistant',
      content: '👋 Hi there! I\'m Shutter, your Photo-book booking assistant. I can help you find photographers and book sessions. What type of photography are you looking for today?',
      timestamp: new Date(),
    }]);
    setError(null);
    setInput('');
  };

  // Don't render if user not authenticated
  if (!user || !isAuthenticated) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? '60px' : '600px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* ========== HEADER ========== */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Shutter</h3>
                  <p className="text-[10px] text-white/80">
                    {isLoading ? 'Thinking...' : 'Photo-book Assistant'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleReset} 
                  title="Reset conversation"
                  className="hover:bg-white/20 p-1 rounded transition-colors"
                >
                  <RotateCcw size={14} />
                </button>
                <button 
                  onClick={loadChatHistory} 
                  title="Refresh chat"
                  className="hover:bg-white/20 p-1 rounded transition-colors"
                >
                  <RotateCcw size={14} />
                </button>
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="hover:bg-white/20 p-1 rounded transition-colors"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 p-1 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* ========== ERROR BANNER ========== */}
                {error && (
                  <div className="bg-red-50 border-b border-red-200 p-3 flex items-start gap-2">
                    <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs text-red-800">
                      <p className="font-semibold">Connection Error</p>
                      <p>{error}</p>
                    </div>
                    <button 
                      onClick={() => setError(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* ========== MESSAGES ========== */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                  {messages.map((msg, index) => (
                    <div 
                      key={`${index}-${msg.timestamp?.getTime() || 0}`} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex flex-col max-w-[90%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        {/* Message bubble */}
                        <div className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          {/* Avatar */}
                          <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            msg.role === 'user' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-purple-100 text-purple-600'
                          }`}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                          </div>

                          {/* Message content */}
                          <div className={`p-3 rounded-2xl text-sm ${
                            msg.role === 'user'
                              ? 'bg-indigo-600 text-white rounded-tr-none'
                              : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none'
                          }`}>
                            {msg.content}
                          </div>
                        </div>

                        {/* ========== STRUCTURED DATA RENDERERS ========== */}
                         {msg.structuredData && (
                          <div className="mt-2 w-full pl-10 pr-2">
                            {msg.structuredData.type === 'photographer_list' && msg.structuredData.data && (
                              <PhotographerList
                                photographers={msg.structuredData.data as PhotographerData[]}
                                onSelect={onSelectPhotographer}
                              />
                            )}
                            {msg.structuredData.type === 'package_list' && msg.structuredData.data && (
                              <PackageList
                                packages={msg.structuredData.data as PackageData[]}
                                photographerId={msg.structuredData.photographerId}
                                onSelect={onSelectPackage}
                              />
                            )}
                            {msg.structuredData.type === 'booking_confirmation' && msg.structuredData.bookingId && (
                              <BookingConfirmation
                                bookingId={msg.structuredData.bookingId}
                              />
                            )}
                            {msg.structuredData.type === 'availability_picker' && msg.structuredData.data && (
                              <AvailabilityPicker
                                data={msg.structuredData.data as AvailabilityData}
                                onSelect={onSelectAvailability}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-2 max-w-[85%]">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                          <Bot size={16} />
                        </div>
                        <div className="p-3 rounded-2xl text-sm bg-white border border-gray-100 shadow-sm rounded-tl-none flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin" /> 
                          <span className="text-gray-600">Searching...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* ========== INPUT ========== */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
                  className="p-4 bg-white border-t border-gray-100 flex gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1 bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2 text-sm outline-none transition-all disabled:opacity-50"
                  />
                  <button 
                    type="submit" 
                    disabled={!input.trim() || isLoading} 
                    className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== FAB BUTTON ========== */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { 
          setIsOpen(!isOpen); 
          setIsMinimized(false); 
        }}
        className={`p-4 rounded-full shadow-2xl flex items-center justify-center transition-all ${
          isOpen 
            ? 'bg-white text-indigo-600 border-2 border-indigo-600' 
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </div>
  );
};

export default AIChatbot;
