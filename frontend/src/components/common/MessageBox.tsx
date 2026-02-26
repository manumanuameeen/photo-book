import React, { useEffect, useState, useCallback } from 'react';
import { messageApi } from '../../services/api/messageApi';
import type { SystemMessage } from '../../services/api/messageApi';
import { Check, CheckCheck, Trash2, Mail, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface MessageBoxProps {
    onClose?: () => void;
}

export const MessageBox: React.FC<MessageBoxProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
    const [messages, setMessages] = useState<SystemMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 5;

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        try {
            const data = activeTab === 'inbox'
                ? await messageApi.getMessages(page, limit)
                : await messageApi.getSentMessages(page, limit);

            setMessages(data.messages);
            setTotalPages(Math.ceil(data.total / limit));
        } catch (err) {
            console.error("Failed to load messages", err);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab, page]);

    useEffect(() => {
        setPage(1);
    }, [activeTab]);

    useEffect(() => {
        fetchMessages();
    }, [activeTab, page]);

    const handleMarkAsRead = async (id: string, isRead: boolean) => {
        if (isRead) return;
        try {
            await messageApi.markAsRead(id);
            setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await messageApi.deleteMessage(id);
            setMessages(prev => prev.filter(m => m.id !== id));
            toast.success("Message deleted");
            
            if (messages.length === 1 && page > 1) {
                setPage(prev => prev - 1);
            } else if (messages.length === 1) {
                fetchMessages();
            }
        } catch (error) {
            toast.error("Failed to delete message");
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-[500px] flex flex-col border border-gray-200">
            
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <Mail size={20} />
                    Messages
                </h3>
                {onClose && (
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="flex border-b">
                <button
                    onClick={() => setActiveTab('inbox')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'inbox'
                        ? 'border-[#764ba2] text-[#764ba2]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Inbox
                </button>
                <button
                    onClick={() => setActiveTab('sent')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'sent'
                        ? 'border-[#764ba2] text-[#764ba2]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Sent
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {loading ? (
                    <div className="text-center py-10 text-gray-400">Loading...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 flex flex-col items-center gap-2">
                        <Mail size={40} className="opacity-20" />
                        <p>No messages in {activeTab}</p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div
                            key={msg.id}
                            className={`p-4 rounded-lg border shadow-sm transition-all hover:shadow-md ${activeTab === 'inbox' && !msg.isRead ? 'bg-white border-l-4 border-l-[#764ba2]' : 'bg-white border-gray-200'
                                }`}
                            onClick={() => activeTab === 'inbox' && handleMarkAsRead(msg.id, msg.isRead)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                        {activeTab === 'inbox' ? `From: ${msg.senderName}` : `To: ${msg.receiverName}`}
                                    </p>
                                    <p className="text-[10px] text-gray-400">{msg.fullDate}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {activeTab === 'sent' && (
                                        <span title={msg.isRead ? "Seen" : "Sent"}>
                                            {msg.isRead ? (
                                                <CheckCheck size={16} className="text-blue-500" />
                                            ) : (
                                                <Check size={16} className="text-gray-400" />
                                            )}
                                        </span>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <p className={`text-sm text-gray-700 ${activeTab === 'inbox' && !msg.isRead ? 'font-semibold' : ''}`}>
                                {msg.content}
                            </p>
                        </div>
                    ))
                )}
            </div>

            <div className="p-3 border-t bg-gray-50 flex items-center justify-between gap-2">
                <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1 || loading}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Previous Page"
                >
                    <ChevronLeft size={16} />
                </button>

                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Page {page} of {totalPages || 1}
                </span>

                <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages || loading}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Next Page"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};
