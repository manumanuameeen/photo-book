import React, { useState, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { Search, User as UserIcon, Camera, MessageCircle, Pin, PinOff, CheckCircle } from 'lucide-react';
import { userPhotographerApi } from '../../../services/api/userPhotographerApi';
import type { UserCompact } from '../chat.types';

interface Contact {
    _id: string;
    name: string;
    firstName: string;
    lastName: string;
    profileImage: string;
    lastMessage?: {
        content?: string;
        createdAt: string | Date;
        senderId: string | { _id: string; name?: string; profileImage?: string; role?: string };
        receiverId: string | { _id: string; name?: string; profileImage?: string; role?: string };
        isRead: boolean;
        type?: string;
    };
    isOnline: boolean;
    role?: string;
    isExisting?: boolean;
    unreadCount?: number;
}

const ChatSidebar: React.FC = () => {
    const { conversations, setSelectedUser, selectedUser, onlineUsers, pinnedUserIds, togglePin } = useChatStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Contact[]>([]);
    const [suggestedContacts, setSuggestedContacts] = useState<Contact[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'pinned'>('all');

    const rawContacts: Contact[] = conversations.map((conv) => {
        const p = conv.partner;
        const _id = p._id || 'system';
        const name = p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'System Notifications';

        return {
            _id,
            name,
            firstName: name.split(' ')[0] || 'User',
            lastName: name.split(' ').slice(1).join(' ') || '',
            profileImage: p.profileImage || '',
            lastMessage: conv.lastMessage,
            unreadCount: conv.unreadCount,
            isOnline: onlineUsers.includes(_id),
            role: p.role || 'user',
            isExisting: true
        };
    });

    const sortedAndFilteredContacts = rawContacts
        .filter(c => {
            if (activeFilter === 'unread') return (c.unreadCount || 0) > 0;
            if (activeFilter === 'pinned') return pinnedUserIds.includes(c._id);
            return true;
        })
        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const aPinned = pinnedUserIds.includes(a._id);
            const bPinned = pinnedUserIds.includes(b._id);
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;

            const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return bTime - aTime;
        });

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const photographers = await userPhotographerApi.getPhotographers({});
                const suggestions = (photographers.photographers || []).slice(0, 5).map((p: { userId?: { _id?: string; name?: string; profileImage?: string } }) => {
                    const name = p.userId?.name || 'Unknown Photographer';
                    return {
                        _id: p.userId?._id || '',
                        name: name,
                        firstName: name.split(' ')[0] || 'Unknown',
                        lastName: name.split(' ').slice(1).join(' ') || '',
                        profileImage: p.userId?.profileImage || '',
                        isOnline: p.userId?._id ? onlineUsers.includes(p.userId._id) : false,
                        role: 'Photographer',
                        isExisting: false
                    };
                }).filter((s: Contact) => s._id);

                const filteredSuggestions = suggestions.filter((s: Contact) => !rawContacts.find(c => c._id === s._id));
                setSuggestedContacts(filteredSuggestions);
            } catch (error) {
                console.error("Failed to fetch suggestions", error);
            }
        };
        fetchSuggestions();
    }, [conversations, onlineUsers]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim().length === 0) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            try {
                const photographers = await userPhotographerApi.getPhotographers({});
                const filtered = (photographers.photographers || []).filter((p: { userId?: { name?: string }; businessName?: string }) => {
                    const name = p.userId?.name || '';
                    const business = p.businessName || '';
                    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        business.toLowerCase().includes(searchTerm.toLowerCase());
                });

                const formatted: Contact[] = filtered.map((p: { userId?: { _id?: string; name?: string; profileImage?: string } }) => {
                    const name = p.userId?.name || 'Unknown Photographer';
                    return {
                        _id: p.userId?._id || '',
                        name: name,
                        firstName: name.split(' ')[0] || 'Unknown',
                        lastName: name.split(' ').slice(1).join(' ') || '',
                        profileImage: p.userId?.profileImage || '',
                        isOnline: p.userId?._id ? onlineUsers.includes(p.userId._id) : false,
                        role: 'Photographer',
                        isExisting: false
                    };
                }).filter((s: Contact) => s._id);

                setSearchResults(formatted);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, onlineUsers]);

    const enhancedContacts = sortedAndFilteredContacts;

    const renderUserItem = (contact: Contact) => (
        <div
            key={contact._id}
            className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 group transition-colors ${selectedUser?._id === contact._id ? 'bg-blue-50/50' : ''}`}
        >
            <div
                className="relative flex-1 flex items-center overflow-hidden"
                onClick={() => {
                    setSelectedUser({
                        _id: contact._id,
                        firstName: contact.firstName,
                        lastName: contact.lastName,
                        email: '',
                        profileImage: contact.profileImage || '',
                        role: contact.role as "user" | "admin" | "photographer"
                    } as UserCompact);
                    setSearchTerm('');
                    setSearchResults([]);
                }}
            >
                <div className="relative shrink-0 mr-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden shadow-sm border border-gray-200">
                        {contact.profileImage ? (
                            <img src={contact.profileImage} alt={contact.name} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-6 h-6 text-gray-400" />
                        )}
                    </div>
                    {contact.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                    )}
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-0.5">
                        <span className="font-semibold text-gray-800 truncate flex items-center gap-1.5 text-[15px]">
                            {contact.name || 'Unknown User'}
                            {contact.role === 'admin' && <CheckCircle size={14} className="text-blue-500 fill-blue-50" />}
                            {pinnedUserIds.includes(contact._id) && <Pin size={12} className="text-blue-500" fill="currentColor" />}
                        </span>
                        <div className="flex flex-col items-end shrink-0 ml-2">
                            <span className={`text-xs ${contact.unreadCount ? 'text-blue-500 font-medium' : 'text-gray-400'}`}>
                                {contact.lastMessage ? new Date(contact.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {contact.role === 'Photographer' && (
                            <span className="bg-purple-100/80 text-purple-700 text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1 shrink-0">
                                <Camera size={10} /> Pro
                            </span>
                        )}
                        {contact.role === 'admin' && (
                            <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1 shrink-0">
                                Admin
                            </span>
                        )}
                        <div className={`text-sm truncate flex-1 leading-tight ${contact.unreadCount ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                            {contact.lastMessage?.content || (contact.lastMessage ? <span className='text-gray-400 italic text-sm'>Attachment</span> : <span className='text-blue-500 text-xs italic'>Check profile</span>)}
                        </div>
                        {contact.unreadCount && contact.unreadCount > 0 ? (
                            <span className="bg-blue-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] h-[20px] flex items-center justify-center shrink-0 shadow-sm">
                                {contact.unreadCount}
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>
            <div className={`ml-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${pinnedUserIds.includes(contact._id) ? 'opacity-100' : ''}`}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        togglePin(contact._id);
                    }}
                    className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-blue-500 transition-colors"
                    title={pinnedUserIds.includes(contact._id) ? "Unpin Chat" : "Pin Chat"}
                >
                    {pinnedUserIds.includes(contact._id) ? <PinOff size={16} /> : <Pin size={16} />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="bg-white px-5 py-4 border-b border-gray-100 flex justify-between items-center z-10 sticky top-0">
                <div className="font-bold text-gray-800 text-xl tracking-tight">Chats</div>
            </div>

            <div className="px-4 py-3 bg-white border-b border-gray-100 space-y-4">
                <div className="relative bg-gray-100/80 rounded-xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:bg-white border border-transparent focus-within:border-blue-300 transition-all shadow-inner">
                    <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search or start new chat"
                        className="bg-transparent border-none outline-none w-full text-[15px] py-1 text-gray-700 placeholder:text-gray-400 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-1.5 no-scrollbar overflow-x-auto pb-1">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all duration-200 ${activeFilter === 'all' ? 'bg-gray-800 text-white shadow-md' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveFilter('unread')}
                        className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all duration-200 ${activeFilter === 'unread' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Unread
                        {rawContacts.filter(c => (c.unreadCount || 0) > 0).length > 0 && (
                            <span className={`w-1.5 h-1.5 rounded-full ${activeFilter === 'unread' ? 'bg-white' : 'bg-blue-500'}`}></span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveFilter('pinned')}
                        className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all duration-200 ${activeFilter === 'pinned' ? 'bg-gray-800 text-white shadow-md' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Pinned
                        {pinnedUserIds.length > 0 && (
                            <span className={`text-[11px] ${activeFilter === 'pinned' ? 'text-gray-300' : 'text-gray-400'}`}>({pinnedUserIds.length})</span>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-4 bg-white">
                {isSearching && <div className="p-8 flex justify-center items-center text-sm font-medium text-gray-400 animate-pulse">Searching directory...</div>}

                {searchTerm.length > 0 && (
                    <div className="animate-in fade-in duration-200">
                        {enhancedContacts.length > 0 && (
                            <div className="px-5 py-2.5 bg-gray-50/80 text-[11px] font-bold text-gray-400 uppercase tracking-widest sticky top-0 z-10 backdrop-blur-sm border-b border-gray-100">
                                Your Conversations
                            </div>
                        )}
                        {enhancedContacts.map(renderUserItem)}

                        {searchResults.filter(r => !enhancedContacts.find(c => c._id === r._id)).length > 0 && (
                            <div className="px-5 py-2.5 bg-gray-50/80 text-[11px] font-bold text-gray-400 uppercase tracking-widest sticky top-0 z-10 backdrop-blur-sm border-b border-gray-100">
                                Global Reach
                            </div>
                        )}
                        {searchResults
                            .filter(r => !enhancedContacts.find(c => c._id === r._id))
                            .map(renderUserItem)
                        }
                    </div>
                )}

                {searchTerm.length === 0 && (
                    <div className="animate-in fade-in duration-200">
                        {enhancedContacts.length > 0 && enhancedContacts.map(renderUserItem)}

                        {suggestedContacts.length > 0 && (
                            <div className="mt-4">
                                <div className="px-5 py-2.5 bg-gradient-to-r from-purple-50/80 to-transparent text-[11px] font-bold text-purple-600/80 uppercase tracking-widest flex items-center gap-1.5 sticky top-0 z-10 backdrop-blur-sm border-b border-purple-50">
                                    <Camera size={13} className="text-purple-400" /> Discover Professionals
                                </div>
                                {suggestedContacts.map(renderUserItem)}
                            </div>
                        )}

                        {enhancedContacts.length === 0 && suggestedContacts.length === 0 && !isSearching && (
                            <div className="flex flex-col items-center justify-center p-8 mt-16 text-center animate-in slide-in-from-bottom-4 duration-500">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                                    <MessageCircle className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-gray-900 font-semibold text-lg mb-1 tracking-tight">It's quiet here</h3>
                                <p className="text-gray-500 text-[15px] max-w-[240px] leading-relaxed">Search for a username or discover professionals to start your first conversation.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatSidebar;
