import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, 
  Loader2, RotateCcw
} from 'lucide-react';
import { useAuthStore } from '../../modules/auth/store/useAuthStore';
import { PhotographerList, PackageList, BookingConfirmation, AvailabilityPicker } from './ChatRenderers';
import type { PhotographerData, PackageData, AvailabilityData } from './ChatRenderers';
import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from "../../constants/routes";
import ErrorCard from './ErrorCard';

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
  isError?: boolean;
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
  error?: string | {
    type?: string;
    retryAfter?: number;
    message?: string;
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
  const [error, setError] = useState<{ message: string; details?: Record<string, unknown> } | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  const [sessionId] = useState(() => `session_${Math.random().toString(36).substring(2, 11)}`);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || 
    (globalThis.location.hostname === "localhost" 
      ? "http://localhost:5000/api/v1" 
      : "/api/v1");

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
      setError({ message: 'Could not load chat history' });
    }
  }, [apiUrl, sessionId, isAuthenticated]);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadChatHistory();
    }
  }, [isOpen, isAuthenticated, loadChatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = useCallback(async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: textToSend, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLastUserMessage(textToSend);
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

      const data: ChatbotApiResponse = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message,
          structuredData: data.structuredData,
          timestamp: new Date(),
        }]);
      } else {
        const errorData = typeof data.error === 'object' ? data.error : { message: data.message };
        
        // Handle rate limit specifically
        if (errorData?.type === 'RATE_LIMIT') {
          const retryAfter = errorData.retryAfter || 10;
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `⏳ I'm a bit overwhelmed with requests right now. Please wait about ${retryAfter} seconds and try again.`,
            timestamp: new Date(),
            isError: true,
          }]);
        } else {
          // Generic error
          setError({ message: data.message || 'Assistant is temporarily unavailable', details: errorData });
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: data.message || "I'm having trouble connecting right now. Please try again soon.",
            timestamp: new Date(),
            isError: true,
          }]);
        }
      }
    } catch (err) {
      console.error('Network error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Network connection error. Please check your internet and try again.",
        timestamp: new Date(),
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, input, isLoading, messages, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const onSelectPhotographer = (photographer: PhotographerData) => {
    const id = photographer._id;
    const name = photographer.businessInfo?.businessName || photographer.personalInfo?.name;
    handleSendMessage(
      `I'm interested in ${name}. Can you show me their packages? (ID: ${id})`
    );
  };

  const onSelectPackage = (pkg: PackageData, photographerId?: string) => {
    if (photographerId) {
      navigate({ 
        to: ROUTES.USER.BOOKING, 
        search: { photographerId, packageId: pkg._id } 
      });
      setIsOpen(false);
    } else {
      handleSendMessage(
        `I'd like to book the "${pkg.name}" package. What information do you need from me? (Package ID: ${pkg._id})`
      );
    }
  };

  const onSelectAvailability = (date: string, time: string) => {
    handleSendMessage(`I'd like to book for ${date} at ${time}.`);
  };

  const handleReset = () => {
    setMessages([{
      role: 'assistant',
      content: '👋 Hi there! I\'m Shutter, your Photo-book booking assistant. I can help you find photographers and book sessions. What type of photography are you looking for today?',
      timestamp: new Date(),
    }]);
    setError(null);
    setInput('');
  };

  const handleRetry = useCallback(async () => {
    if (!lastUserMessage) return;
    setIsRetrying(true);
    setError(null);
    setMessages(prev => prev.slice(0, -1));
    await handleSendMessage(lastUserMessage);
    setIsRetrying(false);
  }, [lastUserMessage, handleSendMessage]);

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
            {/* HEADER */}
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
                {/* ERROR CARD */}
                {error && (
                  <div className="p-4 border-b border-red-200 bg-red-50">
                    <ErrorCard
                      title="Connection Error"
                      message={error.message}
                      error={error.details}
                      onRetry={handleRetry}
                      isRetrying={isRetrying}
                    />
                  </div>
                )}

                {/* MESSAGES */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                  {messages.map((msg, index) => (
                    <div 
                      key={`${index}-${msg.timestamp?.getTime() || 0}`} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex flex-col max-w-[90%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            msg.role === 'user' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-purple-100 text-purple-600'
                          }`}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                          </div>

                          <div className={`p-3 rounded-2xl text-sm ${
                            msg.role === 'user'
                              ? 'bg-indigo-600 text-white rounded-tr-none'
                              : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none'
                          }`}>
                            {msg.content}
                          </div>
                        </div>

                        {/* STRUCTURED DATA RENDERERS */}
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

                {/* INPUT */}
                <div className="border-t border-gray-200 p-3 bg-white shrink-0">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask me anything..."
                      disabled={isLoading}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 text-sm"
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={isLoading || !input.trim()}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};

export default AIChatbot;
