import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, Loader2, RotateCcw } from 'lucide-react';
import { useAuthStore } from '../../modules/auth/store/useAuthStore';
import { PhotographerList, PackageList, BookingConfirmation } from './ChatRenderers';
import type { PhotographerData, PackageData } from './ChatRenderers';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  structuredData?: {
    type: 'photographer_list' | 'package_list' | 'booking_confirmation';
    data?: (PhotographerData | PackageData)[];
    bookingId?: string;
  };
}

interface ChatbotApiResponse {
  success: boolean;
  message: string;
  structuredData?: Record<string, unknown>;
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
      content: 'Hi there! 👋 I\'m Shutter, your Photo-book booking assistant. I can help you find photographers and book sessions directly through our conversation. What type of photography are you looking for today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Math.random().toString(36).substr(2, 9)}`);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuthStore();

  const apiUrl = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000/api/v1" : "/api/v1");

  const loadChatHistory = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/ai/chatbot/history?sessionId=${sessionId}`, {
        credentials: 'include'
      });
      const data: HistoryApiResponse = await response.json();
      if (data.success && data.messages.length > 0) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }, [apiUrl, sessionId]);

  // Load history from DB on mount
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

  const parseStructuredData = (content: string) => {
    const match = content.match(/```structured-data\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        const data = JSON.parse(match[1]);
        const cleanContent = content.replace(/```structured-data\s*[\s\S]*?\s*```/, '').trim();
        return { data, cleanContent };
      } catch (e) {
        console.error('Failed to parse structured data:', e);
      }
    }
    return { data: null, cleanContent: content };
  };

  const handleSendMessage = useCallback(async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

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

      if (!response.ok) throw new Error('AI search failed');

      const data: ChatbotApiResponse = await response.json();

      if (data.success) {
        const { data: structured, cleanContent } = parseStructuredData(data.message);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: cleanContent,
          structuredData: structured as Message['structuredData']
        }]);

      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having a bit of trouble connecting. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, input, isLoading, messages, sessionId]);

  const onSelectPhotographer = (photographer: PhotographerData) => {
    const id = photographer._id;
    const name = photographer.businessInfo?.businessName || photographer.personalInfo?.name;
    handleSendMessage(`I'm interested in booking ${name}. What packages do they offer? (Photographer ID: ${id})`);
  };

  const onSelectPackage = (pkg: PackageData) => {
    handleSendMessage(`I'd like to select the "${pkg.name}" package. How do we proceed with the date and location? (Package ID: ${pkg._id})`);
  };

  if (!user && !isAuthenticated) return null;

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
            className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Shutter</h3>
                  <p className="text-[10px] text-white/80">Photo-book Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={loadChatHistory} title="Refresh chat"><RotateCcw size={14} /></button>
                <button onClick={() => setIsMinimized(!isMinimized)}>{isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}</button>
                <button onClick={() => setIsOpen(false)}><X size={16} /></button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                  {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex flex-col max-w-[90%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                          </div>
                          <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none'}`}>
                            {msg.content}
                          </div>
                        </div>

                        {/* Structured Data Renderers */}
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
                                onSelect={onSelectPackage}
                              />
                            )}
                            {msg.structuredData.type === 'booking_confirmation' && msg.structuredData.bookingId && (
                              <BookingConfirmation
                                bookingId={msg.structuredData.bookingId}
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
                        <div className="shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center"><Bot size={16} /></div>
                        <div className="p-3 rounded-2xl text-sm bg-white border border-gray-100 shadow-sm rounded-tl-none flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin" /> Thinking...
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2 text-sm outline-none transition-all"
                  />
                  <button type="submit" disabled={!input.trim() || isLoading} className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all">
                    <Send size={18} />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setIsOpen(!isOpen); setIsMinimized(false); }}
        className={`p-4 rounded-full shadow-2xl flex items-center justify-center transition-all ${isOpen ? 'bg-white text-indigo-600' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'}`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </div>
  );
};

export default AIChatbot;
