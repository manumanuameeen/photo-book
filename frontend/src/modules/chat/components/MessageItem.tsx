import React, { useState } from 'react';
import type { IMessage } from '../chat.types';
import { Check, CheckCheck, Mic, Trash2, Edit2, Reply, MoreVertical, Clock, CheckCircle } from 'lucide-react';

interface MessageItemProps {
    message: IMessage;
    isMe: boolean;
    onReply: (message: IMessage) => void;
    onEdit: (message: IMessage, newContent: string) => void;
    onDelete: (message: IMessage) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isMe, onReply, onEdit, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);

    const renderContentWithLinks = (content: string) => {
        if (!content) return null;

        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const instagramRegex = /@([a-zA-Z0-9_._]+)/g;
        const parts = content.split(/(\s+)/);

        return parts.map((part, index) => {
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={index}
                        href={part.startsWith('http') ? part : `https://${part}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:underline break-all font-medium ${isMe ? 'text-green-800' : 'text-blue-600'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </a>
                );
            }

            if (part.match(instagramRegex)) {
                const username = part.substring(1);
                return (
                    <a
                        key={index}
                        href={`https://instagram.com/${username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:underline font-medium ${isMe ? 'text-green-800' : 'text-blue-600'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </a>
                );
            }

            return part;
        });
    };

    const handleEditSave = () => {
        if (editContent.trim() !== message.content) {
            onEdit(message, editContent);
        }
        setIsEditing(false);
    };

    if (message.isDeleted) {
        return (
            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full my-1`}>
                <div className={`px-4 py-2 bg-gray-100/80 backdrop-blur-sm rounded-2xl text-gray-400 text-[13px] italic border border-gray-200/50 shadow-sm ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                    This message was deleted
                </div>
            </div>
        );
    }

    if (message.type === 'SYSTEM' && (!message.senderId || typeof message.senderId === 'string' || !('role' in message.senderId))) {
        return (
            <div className="flex justify-center w-full my-3">
                <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700/50 text-gray-200 rounded-2xl px-5 py-3 text-sm shadow-md max-w-[85%] text-center relative">
                    <div className="font-bold text-[11px] mb-1.5 uppercase tracking-widest flex items-center justify-center gap-1.5 text-gray-400">
                        <span>🛡️</span> System Alert
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed font-medium">
                        {renderContentWithLinks(message.content)}
                    </div>
                    <div className="text-[10px] mt-2 text-gray-500 font-medium">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative w-full my-[2px]`}
            onMouseLeave={() => setShowMenu(false)}
        >
            <div
                className={`max-w-[75%] md:max-w-[65%] rounded-2xl px-3.5 py-2.5 shadow-sm text-[15px] relative transition-all ${isMe
                    ? 'bg-[#dcf8c6] text-gray-900 rounded-tr-[4px] border border-[#d3efbd]'
                    : 'bg-white text-gray-900 rounded-tl-[4px] border border-gray-100'
                    } ${isEditing ? 'w-full max-w-[90%]' : ''}`}
            >
                
                <button
                    className={`absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-700 transition-colors rounded-full hover:bg-black/5 opacity-0 group-hover:opacity-100 focus:opacity-100 ${showMenu ? 'opacity-100' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                >
                    <MoreVertical size={16} />
                </button>

                {showMenu && (
                    <div className={`absolute top-8 ${isMe ? 'right-0' : 'left-0'} bg-white shadow-xl rounded-xl z-50 py-1.5 min-w-[160px] border border-gray-100 animate-in zoom-in-95 duration-100 origin-top-right`}>
                        <button onClick={(e) => { e.stopPropagation(); onReply(message); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-[14px] font-medium hover:bg-gray-50 flex items-center gap-2.5 text-gray-700 transition-colors">
                            <Reply size={16} className="text-gray-400" /> Reply
                        </button>
                        {isMe && (
                            <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-[14px] font-medium hover:bg-gray-50 flex items-center gap-2.5 text-gray-700 transition-colors">
                                <Edit2 size={16} className="text-gray-400" /> Edit
                            </button>
                        )}
                        <div className="h-px bg-gray-100 my-1" />
                        <button onClick={(e) => { e.stopPropagation(); onDelete(message); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-[14px] font-medium hover:bg-red-50 text-red-600 flex items-center gap-2.5 transition-colors">
                            <Trash2 size={16} /> Delete
                        </button>
                    </div>
                )}

                {message.replyTo && (
                    <div className={`mb-2 mt-1 p-2 rounded-xl text-[13px] border-l-4 cursor-pointer hover:opacity-80 transition-opacity ${isMe ? 'bg-[#cbf5c4]/60 border-[#25d366]' : 'bg-gray-100 border-blue-500'}`}>
                        <div className={`font-bold mb-0.5 ${isMe ? 'text-[#075e54]' : 'text-blue-600'}`}>
                            {typeof message.replyTo === 'object' && 'senderId' in message.replyTo ? (typeof message.replyTo.senderId === 'object' ? message.replyTo.senderId.name || 'User' : 'User') : 'Message'}
                        </div>
                        <div className="truncate text-gray-600 font-medium">
                            {typeof message.replyTo === 'object' ? message.replyTo.content || 'Attachment' : '...'}
                        </div>
                    </div>
                )}

                {message.attachment && message.attachment.type === 'image' && (
                    <div className="mb-2 mt-1">
                        <img src={message.attachment.url} alt="Attachment" className="rounded-xl w-full h-auto max-h-[300px] object-cover cursor-pointer hover:opacity-95 transition-opacity border border-black/5" />
                    </div>
                )}

                {message.attachment && message.attachment.type === 'audio' && (
                    <div className="mb-2 mt-1 min-w-[220px] flex items-center gap-3 bg-black/5 rounded-full px-2 py-1 border border-black/5">
                        <div className={`p-2 rounded-full flex shrink-0 ${isMe ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                            <Mic size={18} fill="currentColor" />
                        </div>
                        <audio controls controlsList="nodownload noplaybackrate" src={message.attachment.url} className="w-full h-8 outline-none [&::-webkit-media-controls-panel]:bg-transparent" />
                    </div>
                )}

                {!isMe && typeof message.senderId === 'object' && message.senderId && 'role' in message.senderId && message.senderId.role === 'admin' && (
                    <div className="flex items-center gap-1.5 text-blue-600 mb-1.5 pb-1 border-b border-blue-100/50">
                        <CheckCircle size={14} className="fill-blue-50" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Admin Verified</span>
                    </div>
                )}

                {isEditing ? (
                    <div className="flex flex-col gap-2 min-w-[240px] mt-1">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-xl bg-white text-[15px] outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none"
                            rows={3}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsEditing(false)} className="text-[13px] font-semibold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-black/5 transition-colors">Cancel</button>
                            <button onClick={handleEditSave} className="text-[13px] font-bold bg-green-500 text-white px-4 py-1.5 rounded-lg shadow-sm hover:bg-green-600 transition-colors">Save</button>
                        </div>
                    </div>
                ) : (
                    <div className={`whitespace-pre-wrap leading-[1.35] ${showMenu ? 'pr-6' : ''}`}>
                        {renderContentWithLinks(message.content)}
                    </div>
                )}

                <div className={`text-[10px] sm:text-[11px] mt-1.5 -mb-1 flex justify-end items-center gap-1.5 font-medium ${isMe ? 'text-[#075e54]/70' : 'text-gray-400'}`}>
                    {message.isEdited && <span className="italic mr-1">edited</span>}
                    <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                    {isMe && !message.isDeleted && (
                        <span className="flex items-center">
                            {message.status === 'sending' ? (
                                <Clock size={12} className="text-[#075e54]/50" />
                            ) : (
                                message.isRead ? <CheckCheck size={16} className="text-blue-500 -ml-0.5" /> : <Check size={15} className="text-[#075e54]/60" />
                            )}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
