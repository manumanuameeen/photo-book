import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { ChatApi } from '../services/chatApi';
import type { IMessage } from '../chat.types';
import { Send, Smile, X, Mic, Square, Volume2, VolumeX, MoreVertical, Trash2, ArrowDown, CheckCircle } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';
import { MessageItem } from './MessageItem';

const ChatWindow: React.FC = () => {
    const {
        selectedUser,
        activeChatMessages,
        sendMessage,
        typingUsers,
        replyTo,
        setReplyTo,
        editMessage,
        deleteMessageForMe,
        deleteMessageForEveryone,
        clearChat,
        fetchActiveChatMessages
    } = useChatStore();

    const { user: currentUser } = useAuthStore();

    const getUserId = (userOrId: string | { _id?: string; id?: string } | undefined | null): string => {
        if (!userOrId) return '';
        if (typeof userOrId === 'object') return userOrId._id || userOrId.id || '';
        return userOrId;
    };

    const currentUserId = getUserId(currentUser);

    // Fetch messages for active user
    useEffect(() => {
        if (selectedUser) {
            fetchActiveChatMessages(selectedUser._id);
        }
    }, [selectedUser, fetchActiveChatMessages]);

    const [input, setInput] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const [wallpaper, setWallpaper] = useState<string>(localStorage.getItem('chatWallpaper') || '#e5ddd5');
    const [messageToDelete, setMessageToDelete] = useState<IMessage | null>(null);
    const [showWallpaperMenu, setShowWallpaperMenu] = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleDeleteForMe = async () => {
        if (!messageToDelete) return;
        await deleteMessageForMe(messageToDelete._id);
        setMessageToDelete(null);
    };

    const handleDeleteForEveryone = async () => {
        if (!messageToDelete) return;
        await deleteMessageForEveryone(messageToDelete._id);
        setMessageToDelete(null);
    };

    const handleClearChat = async () => {
        if (!selectedUser) return;
        if (globalThis.confirm("Are you sure you want to clear this entire chat for you?")) {
            await clearChat(selectedUser._id);
            setShowWallpaperMenu(false);
        }
    };

    const handleWallpaperChange = (color: string) => {
        setWallpaper(color);
        localStorage.setItem('chatWallpaper', color);
        setShowWallpaperMenu(false);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                if (audioBlob.size === 0) {
                    console.warn("Audio recording was empty");
                    setIsRecording(false);
                    return;
                }

                const audioFile = new File([audioBlob], "voice_message.webm", { type: 'audio/webm' });
                setIsUploading(true);
                try {
                    const uploaded = await ChatApi.uploadFile(audioFile);
                    await sendMessage("", {
                        url: uploaded.url,
                        type: 'audio'
                    });
                } catch (err) {
                    console.error("Failed to send audio", err);
                } finally {
                    setIsUploading(false);
                }
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    const handleScroll = () => {
        if (!chatContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        
        if (scrollHeight - scrollTop - clientHeight > 100) {
            setShowScrollButton(true);
        } else {
            setShowScrollButton(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        scrollToBottom('auto');
    }, [activeChatMessages]);

    const handleSend = async () => {
        if (!input.trim() || isUploading) return;

        setIsUploading(true);
        try {
            const contentToSend = input.trim();
            await sendMessage(contentToSend);
            setInput('');
            setShowEmojiPicker(false);
            scrollToBottom('smooth');
        } catch (error) {
            console.error("Failed to send", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    useEffect(() => {
        if (selectedUser && activeChatMessages.length > 0) {
            const unreadMessages = activeChatMessages.filter(m => !m.isRead && !m._id.startsWith('temp_') && getUserId(m.senderId) !== currentUserId);
            if (unreadMessages.length > 0) {
                
                Promise.all(unreadMessages.map(msg => ChatApi.markAsRead(msg._id).catch(err => { console.error("Failed to mark read", err); })))
                    .then(() => {
                        
                        useChatStore.getState().clearUnreadForPartner(selectedUser._id);
                    })
                    .catch(() => {
                        
                    });
            }
        }
    }, [activeChatMessages, selectedUser, currentUserId]);

    if (!selectedUser) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50/50">
                <div className="p-8 bg-white rounded-3xl shadow-sm mb-6 border border-gray-100 flex items-center justify-center animate-in zoom-in duration-500">
                    <div className="text-5xl drop-shadow-sm">👋</div>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">Welcome to Chat</h2>
                <p className="mt-2 text-gray-500 text-sm font-medium">Select a conversation to start messaging</p>
            </div>
        );
    }

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setInput(prev => prev + emojiData.emoji);
    };

    return (
        <div className="flex flex-col h-full relative" style={{ backgroundColor: wallpaper }}>
            {messageToDelete && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl mx-4 transform transition-all animate-in zoom-in-95">
                        <h3 className="text-lg font-bold mb-2 text-gray-800 tracking-tight">Delete message?</h3>
                        <p className="text-gray-500 mb-6 text-[15px] leading-relaxed">
                            Choose how you want to delete this message.
                        </p>
                        <div className="flex flex-col gap-2">
                            {getUserId(messageToDelete.senderId) === currentUserId && (Date.now() - new Date(messageToDelete.createdAt).getTime() < 3600000) && (
                                <button
                                    onClick={handleDeleteForEveryone}
                                    className="w-full text-center px-4 py-2.5 text-[15px] text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-colors"
                                >
                                    Delete for everyone
                                </button>
                            )}
                            <button
                                onClick={handleDeleteForMe}
                                className="w-full text-center px-4 py-2.5 text-[15px] text-blue-600 hover:bg-blue-50 rounded-xl font-semibold transition-colors"
                            >
                                Delete for me
                            </button>
                            <button
                                onClick={() => setMessageToDelete(null)}
                                className="w-full text-center px-4 py-2.5 text-[15px] text-gray-600 hover:bg-gray-100 rounded-xl font-semibold transition-colors mt-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white/95 backdrop-blur-md p-3 px-5 flex items-center border-b border-gray-200 z-10 justify-between sticky top-0 shadow-sm">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-gray-700 font-bold mr-3 shadow-sm border border-gray-200 overflow-hidden shrink-0">
                        {selectedUser.profileImage ? (
                            <img src={selectedUser.profileImage} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            selectedUser.firstName?.[0] || 'U'
                        )}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900 tracking-tight text-[15px] flex items-center gap-1.5">
                            {selectedUser.firstName} {selectedUser.lastName}
                            {selectedUser.role === 'admin' && <CheckCircle size={15} className="text-blue-500 fill-blue-50" />}
                        </div>
                        {typingUsers.includes(selectedUser._id) ? (
                            <div className="text-xs text-green-500 font-medium animate-pulse">typing...</div>
                        ) : (
                            <div className="text-xs text-gray-500 font-medium capitalize">{selectedUser.role || 'User'}</div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setIsSoundEnabled(!isSoundEnabled)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                    <div className="relative">
                        <button onClick={() => setShowWallpaperMenu(!showWallpaperMenu)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <MoreVertical size={20} className="text-gray-500" />
                        </button>
                        {showWallpaperMenu && (
                            <div className="absolute top-12 right-0 bg-white shadow-xl rounded-xl py-2 min-w-[200px] z-50 border border-gray-100 animate-in slide-in-from-top-2 duration-200">
                                <button
                                    onClick={handleClearChat}
                                    className="w-full text-left px-5 py-2.5 text-[15px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                >
                                    <Trash2 size={16} /> Clear Chat
                                </button>
                                <div className="h-px bg-gray-100 my-2" />
                                <div className="px-5 py-2">
                                    <p className="text-[11px] uppercase font-bold text-gray-400 mb-3 tracking-wider">Wallpaper</p>
                                    <div className="grid grid-cols-4 gap-2.5">
                                        {['#e5ddd5', '#dcf8c6', '#ece5dd', '#f0f2f5', '#ccebdc', '#d9fdd3', '#ffffff', '#000000'].map(c => (
                                            <button
                                                key={c}
                                                className={`w-7 h-7 rounded-full shadow-sm ring-offset-2 transition-all ${wallpaper === c ? 'ring-2 ring-blue-500 scale-110' : 'border border-gray-200 hover:scale-110'}`}
                                                style={{ backgroundColor: c }}
                                                onClick={() => handleWallpaperChange(c)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-1 scroller"
            >
                {activeChatMessages.map((msg: IMessage) => {
                    const msgSenderId = getUserId(msg.senderId);
                    const isMe = msgSenderId === currentUserId;
                    return (
                        <MessageItem
                            key={msg._id}
                            message={msg}
                            isMe={isMe}
                            onReply={(m) => setReplyTo(m)}
                            onEdit={(m, newContent) => editMessage(m._id, newContent)}
                            onDelete={(m) => setMessageToDelete(m)}
                        />
                    );
                })}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {showScrollButton && (
                <button
                    onClick={() => scrollToBottom('smooth')}
                    className="absolute bottom-24 right-6 p-2 bg-white text-gray-600 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 hover:text-blue-500 transition-all animate-in fade-in z-20"
                >
                    <ArrowDown size={20} />
                </button>
            )}

            {showEmojiPicker && (
                <div ref={emojiPickerRef} className="absolute bottom-20 left-4 z-20 shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
                    <EmojiPicker onEmojiClick={onEmojiClick} width={320} height={400} />
                </div>
            )}

            <div className="bg-white/95 backdrop-blur-md shrink-0">
                {replyTo && (
                    <div className="bg-gray-50/80 px-4 py-2 flex justify-between items-center border-t border-gray-200 animate-in slide-in-from-bottom-2 duration-200">
                        <div className="flex flex-col text-[13px] border-l-[3px] border-blue-500 pl-3 py-1 mr-2 w-full">
                            <span className="text-blue-600 font-semibold tracking-tight">Replying to {typeof replyTo.senderId === 'object' ? replyTo.senderId.name || 'User' : 'User'}</span>
                            <span className="text-gray-500 truncate leading-tight mt-0.5">{replyTo.content || 'Attachment'}</span>
                        </div>
                        <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                )}

                <div className="px-4 py-3 pb-4 md:pb-3 flex items-end gap-2 border-t border-gray-200">
                    {isRecording ? (
                        <div className="flex-1 flex items-center gap-4 bg-red-50/80 rounded-2xl px-5 py-3 h-[46px] border border-red-100 animate-in fade-in duration-300">
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-sm" />
                            <span className="text-[15px] text-red-600 font-semibold tracking-tight">Recording audio...</span>
                            <div className="flex-1" />
                            <button
                                onClick={stopRecording}
                                className="text-red-500 hover:text-red-700 bg-white p-1.5 rounded-full shadow-sm"
                            >
                                <Square fill="currentColor" size={16} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className={`p-2.5 rounded-full transition-colors flex shrink-0 h-[46px] items-center justify-center ${showEmojiPicker ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                            >
                                <Smile className="w-[22px] h-[22px]" />
                            </button>
                            <div className="flex-1 bg-gray-100/80 rounded-2xl flex items-center px-4 min-h-[46px] max-h-32 border border-transparent focus-within:border-gray-300 focus-within:bg-white transition-all shadow-inner relative overflow-hidden">
                                <textarea
                                    className="flex-1 bg-transparent border-none outline-none text-[15px] placeholder-gray-400 py-3 resize-none placeholder:font-medium text-gray-800"
                                    placeholder="Type a message..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    rows={1}
                                    style={{ minHeight: '46px' }}
                                />
                            </div>
                            {input.length === 0 ? (
                                <button
                                    onClick={startRecording}
                                    className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 flex shrink-0 h-[46px] items-center justify-center"
                                >
                                    <Mic className="w-[22px] h-[22px]" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSend}
                                    disabled={isUploading}
                                    className={`p-0 w-[46px] h-[46px] rounded-full text-white transition-all shadow-md flex items-center justify-center shrink-0 ${isUploading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600 hover:scale-105 active:scale-95'}`}
                                >
                                    <Send className="w-[20px] h-[20px] ml-1" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
