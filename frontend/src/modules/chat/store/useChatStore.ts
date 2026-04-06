import { create } from "zustand";
import { ChatApi } from "../services/chatApi";
import type { IMessage, UserCompact } from "../chat.types";
import { socketService } from "../services/socketService";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { toast } from "sonner";

const getIds = (field: string | { _id: string } | undefined | null): string => {
    if (!field) return '';
    return typeof field === 'object' && '_id' in field ? field._id.toString() : field.toString();
};

export interface IConversation {
    partner: UserCompact;
    lastMessage: IMessage;
    unreadCount: number;
}

interface ChatState {
    conversations: IConversation[];
    activeChatMessages: IMessage[];
    selectedUser: UserCompact | null;
    onlineUsers: string[];
    typingUsers: string[];
    isLoading: boolean;
    replyTo: IMessage | null;
    pinnedUserIds: string[];

    setSelectedUser: (user: UserCompact | null) => void;
    setReplyTo: (message: IMessage | null) => void;
    fetchConversations: () => Promise<void>;
    fetchActiveChatMessages: (partnerId: string) => Promise<void>;
    sendMessage: (content: string, attachment?: { url: string; type: string }) => Promise<void>;
    editMessage: (messageId: string, content: string) => Promise<void>;
    deleteMessageForMe: (messageId: string) => Promise<void>;
    deleteMessageForEveryone: (messageId: string) => Promise<void>;
    clearChat: (partnerId: string) => Promise<void>;
    receiveMessage: (message: IMessage) => void;
    updateMessageStatus: (messageId: string, status: Partial<IMessage>) => void;
    updateMessage: (message: IMessage) => void;
    setTyping: (userId: string, isTyping: boolean) => void;
    togglePin: (userId: string) => void;
    toggleReaction: (messageId: string, emoji: string) => Promise<void>;
    initSocket: () => void;
    clearUnreadForPartner: (partnerId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    conversations: [],
    activeChatMessages: [],
    selectedUser: null,
    onlineUsers: [],
    typingUsers: [],
    isLoading: false,
    replyTo: null,
    pinnedUserIds: JSON.parse(localStorage.getItem("pinned_chats") || "[]"),

    setSelectedUser: (user) => set({ selectedUser: user }),
    setReplyTo: (message) => set({ replyTo: message }),

    fetchConversations: async () => {
        set({ isLoading: true });
        try {
            const data = await ChatApi.getConversations();
            set({ conversations: data as IConversation[], isLoading: false });
        } catch (error) {
            console.error("Failed to fetch conversations", error);
            set({ isLoading: false });
        }
    },

    fetchActiveChatMessages: async (partnerId: string) => {
        set({ isLoading: true });
        try {
            const data = await ChatApi.getMessages(partnerId);

            set({ activeChatMessages: data.messages.reverse(), isLoading: false });
        } catch (error) {
            console.error("Failed to fetch active chat messages", error);
            set({ isLoading: false });
        }
    },

    sendMessage: async (content: string, attachment?: { url: string; type: string }) => {
        const { selectedUser, updateMessageStatus, replyTo, setReplyTo } = get();
        if (!selectedUser) return;

        const currentUser = useAuthStore.getState().user as unknown as UserCompact;
        const currentUserId = currentUser?._id;

        const tempId = `temp_${Date.now()}`;
        const tempMessage: IMessage = {
            _id: tempId,
            senderId: currentUserId,
            receiverId: selectedUser._id,
            content,
            attachment: attachment ? { ...attachment, type: attachment.type as "image" | "video" | "file" | "audio" } : undefined,
            type: "DIRECT",
            isRead: false,
            createdAt: new Date().toISOString(),
            status: 'sending',
            replyTo: replyTo || undefined
        };

        // Add temp message directly to active chat (don't use receiveMessage - it's for incoming messages only)
        set((state) => {
            const activeChatMessages = [...state.activeChatMessages, tempMessage];
            
            // Update or create conversation
            const conversations = [...state.conversations];
            const index = conversations.findIndex(c => getIds(c.partner?._id) === selectedUser._id);
            
            if (index !== -1) {
                conversations[index].lastMessage = tempMessage;
                const [conv] = conversations.splice(index, 1);
                conversations.unshift(conv);
            } else {
                conversations.unshift({
                    partner: selectedUser,
                    lastMessage: tempMessage,
                    unreadCount: 0
                });
            }
            
            return { activeChatMessages, conversations };
        });
        
        setReplyTo(null);

        try {
            const replyToId = replyTo ? replyTo._id : undefined;
            const newMessage = await ChatApi.sendMessage(selectedUser._id, content, attachment, replyToId);

            set((state) => {
                const activeChatMessages = state.activeChatMessages.map(m => m._id === tempId ? { ...newMessage, status: 'sent' as const } : m);

                const conversations = [...state.conversations];
                const index = conversations.findIndex(c => getIds(c.partner?._id) === selectedUser._id);
                if (index !== -1) {
                    conversations[index].lastMessage = { ...newMessage, status: 'sent' as const };
                    const [conv] = conversations.splice(index, 1);
                    conversations.unshift(conv);
                }

                return { activeChatMessages, conversations };
            });

        } catch (error) {
            console.error("Failed to send message", error);
            updateMessageStatus(tempId, { status: 'failed' });
        }
    },

    receiveMessage: (message: IMessage) => {
        set((state) => {
            const senderId = getIds(message.senderId) || 'system';
            const receiverId = getIds(message.receiverId) || 'system';
            const currentUserId = getIds(useAuthStore.getState().user?._id);

            const isSender = senderId === currentUserId;
            const partnerId = isSender ? receiverId : senderId;

            const selectedUserId = getIds(state.selectedUser?._id);
            const isChattingWithSender = !!selectedUserId && selectedUserId === partnerId;

            let newActiveMessages = state.activeChatMessages;
            if (isChattingWithSender) {
                // Avoid duplicates: check if message already exists by ID
                const existingIndex = state.activeChatMessages.findIndex(m => m._id === message._id);
                
                if (existingIndex !== -1) {
                    // Update existing message if needed (e.g., status or content updates)
                    newActiveMessages = state.activeChatMessages.map(m => 
                        m._id === message._id ? { ...m, ...message, status: 'sent' as const } : m
                    );
                } else if (isSender) {
                    // If it's my message, check if a temporary version exists that hasn't been replaced
                    const tempIndex = state.activeChatMessages.findIndex(m => 
                        m._id.startsWith('temp_') && 
                        m.content === message.content &&
                        getIds(m.receiverId) === partnerId
                    );

                    if (tempIndex !== -1) {
                        // Found a matching temp message, replace it!
                        newActiveMessages = [...state.activeChatMessages];
                        newActiveMessages[tempIndex] = { ...message, status: 'sent' as const };
                    } else {
                        // Message from another device or temp already gone/mismatched - add it
                        newActiveMessages = [...state.activeChatMessages, message];
                    }
                } else {
                    // Message from partner - append it
                    newActiveMessages = [...state.activeChatMessages, message];
                }
            } else if (!isSender) {
                try {
                    let soundUrl = "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3";
                    if (message.type === 'SYSTEM') {
                        soundUrl = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
                    }
                    const audio = new Audio(soundUrl);
                    audio.play().catch(e => console.warn("Audio play failed", e));
                } catch (e) {
                    console.error("Audio error", e);
                }

                if (message.type === 'SYSTEM') {
                    toast.warning(`System Notification: ${message.content}`);
                } else {
                    const senderObj = message.senderId as Partial<UserCompact>;
                    const senderName = senderObj?.firstName || senderObj?.name || 'Someone';
                    toast.info(`New message from ${senderName}: ${message.content || 'Attachment'}`);
                }
            }

            const conversations = [...state.conversations];
            const index = conversations.findIndex(c => getIds(c.partner?._id) === partnerId);

            if (index !== -1) {
                conversations[index].lastMessage = message;
                if (!isSender && !isChattingWithSender) {
                    conversations[index].unreadCount += 1;
                }
                const [conv] = conversations.splice(index, 1);
                conversations.unshift(conv);
            } else {
                // Correctly identify the partner object
                let partnerObj: UserCompact;

                if (message.type === 'SYSTEM') {
                    partnerObj = { _id: 'system', name: 'System Notification', role: 'admin', firstName: 'System', lastName: 'Notification', email: '' };
                } else if (isSender && state.selectedUser && getIds(state.selectedUser._id) === partnerId) {
                    // If I'm the sender, use the selectedUser (receiver) - we always know who we're sending to
                    partnerObj = state.selectedUser;
                } else {
                    // For received messages or other cases, extract from message
                    const potentialPartner = isSender ? message.receiverId : message.senderId;

                    if (typeof potentialPartner === 'object' && potentialPartner !== null && '_id' in potentialPartner) {
                        // Partner is already an object with _id - use it directly
                        partnerObj = potentialPartner as UserCompact;
                    } else {
                        // Fallback: create minimal object from available data
                        const partnerData = typeof potentialPartner === 'object' && potentialPartner !== null ? (potentialPartner as Partial<UserCompact>) : {};
                        partnerObj = { 
                            _id: partnerId, 
                            name: partnerData?.name || partnerData?.firstName || '', 
                            firstName: partnerData?.firstName || '', 
                            lastName: partnerData?.lastName || '', 
                            email: partnerData?.email || '', 
                            role: partnerData?.role || 'user' 
                        };
                    }
                }

                conversations.unshift({
                    partner: partnerObj,
                    lastMessage: message,
                    unreadCount: (!isSender && !isChattingWithSender) ? 1 : 0
                });
            }

            return {
                activeChatMessages: newActiveMessages,
                conversations
            };
        });
    },

    deleteMessageForMe: async (messageId: string) => {
        set((state) => {
            const activeChatMessages = state.activeChatMessages.filter(m => m._id !== messageId);
            return { activeChatMessages };
        });

        try {
            await ChatApi.deleteMessageForMe(messageId);
        } catch (error) {
            console.error("Failed to delete message for me", error);
        }
    },

    deleteMessageForEveryone: async (messageId: string) => {
        const updateState = (msg: IMessage) => {
            if (msg._id === messageId) {
                return { ...msg, isDeleted: true, content: 'This message was deleted', attachment: undefined };
            }
            return msg;
        };

        set((state) => {
            const activeChatMessages = state.activeChatMessages.map(updateState);
            const conversations = state.conversations.map(c => {
                if (c.lastMessage?._id === messageId) {
                    return { ...c, lastMessage: updateState(c.lastMessage) };
                }
                return c;
            });

            return { activeChatMessages, conversations };
        });

        try {
            await ChatApi.deleteMessageForEveryone(messageId);
        } catch (error) {
            console.error("Failed to delete message for everyone", error);
            toast.error(error instanceof Error ? error.message : "Failed to delete message");
        }
    },

    clearChat: async (partnerId: string) => {
        set((state) => {
            const conversations = state.conversations.filter(c => getIds(c.partner?._id) !== partnerId);
            const activeChatMessages = state.selectedUser?._id === partnerId ? [] : state.activeChatMessages;

            return { conversations, activeChatMessages };
        });

        try {
            await ChatApi.clearChat(partnerId);
            toast.success("Chat cleared");
        } catch (error) {
            console.error("Failed to clear chat", error);
        }
    },

    editMessage: async (messageId: string, content: string) => {
        const updateState = (msg: IMessage) => {
            if (msg._id === messageId) {
                return { ...msg, content, isEdited: true };
            }
            return msg;
        };

        set((state) => {
            const activeChatMessages = state.activeChatMessages.map(updateState);
            const conversations = state.conversations.map(c => {
                if (c.lastMessage?._id === messageId) {
                    return { ...c, lastMessage: updateState(c.lastMessage) };
                }
                return c;
            });

            return { activeChatMessages, conversations };
        });

        try {
            await ChatApi.editMessage(messageId, content);
        } catch (error) {
            console.error("Failed to edit message", error);
        }
    },

    updateMessage: (message: IMessage) => {
        set((state) => {
            const updateState = (m: IMessage) => m._id === message._id ? message : m;

            const activeChatMessages = state.activeChatMessages.map(updateState);
            const conversations = state.conversations.map(c => {
                if (c.lastMessage?._id === message._id) {
                    return { ...c, lastMessage: message };
                }
                return c;
            });

            return { activeChatMessages, conversations };
        });
    },

    updateMessageStatus: (messageId, status) => {
        set((state) => {
            const activeChatMessages = state.activeChatMessages.map(m =>
                m._id === messageId ? { ...m, ...status } : m
            );

            const conversations = state.conversations.map(c => {
                if (c.lastMessage?._id === messageId) {
                    return { ...c, lastMessage: { ...c.lastMessage, ...status } };
                }
                return c;
            });

            return { activeChatMessages, conversations };
        });
    },

    clearUnreadForPartner: (partnerId: string) => {
        set((state) => {
            const conversations = state.conversations.map(c =>
                getIds(c.partner?._id) === partnerId ? { ...c, unreadCount: 0 } : c
            );

            const activeChatMessages = state.activeChatMessages.map(m =>
                getIds(m.senderId) === partnerId ? { ...m, isRead: true } : m
            );

            return { conversations, activeChatMessages };
        });
    },

    setTyping: (userId: string, isTyping: boolean) => {
        set((state) => {
            const users = new Set(state.typingUsers);
            if (isTyping) users.add(userId);
            else users.delete(userId);
            return { typingUsers: Array.from(users) };
        });
    },

    togglePin: (userId: string) => {
        set((state) => {
            const isPinned = state.pinnedUserIds.includes(userId);
            const newPinned = isPinned
                ? state.pinnedUserIds.filter(id => id !== userId)
                : [...state.pinnedUserIds, userId];
            localStorage.setItem("pinned_chats", JSON.stringify(newPinned));
            return { pinnedUserIds: newPinned };
        });
    },

    toggleReaction: async (messageId: string, emoji: string) => {
        try {
            const updatedMessage = await ChatApi.toggleReaction(messageId, emoji);
            get().updateMessage(updatedMessage);
        } catch (error) {
            console.error("Failed to toggle reaction", error);
            toast.error("Failed to react to message");
        }
    },

    initSocket: () => {
        const { receiveMessage, setTyping, updateMessage } = get();
        const { accessToken } = useAuthStore.getState();
        
        // Remove existing listeners if any
        socketService.off("message_updated");
        socketService.off("new_message");
        socketService.off("message_read");
        socketService.off("typing");
        socketService.off("stop_typing");

        socketService.connect(accessToken || undefined);

        socketService.on("message_updated", (data: unknown) => {
            const message = data as IMessage;
            updateMessage(message);
        });

        socketService.on("new_message", (data: unknown) => {
            const message = data as IMessage;
            receiveMessage(message);
        });

        socketService.on("message_read", (data: unknown) => {
            const message = data as IMessage;
            get().updateMessageStatus(message._id, { isRead: true });
        });

        socketService.on("typing", (data: unknown) => {
            const { senderId } = data as { senderId: string };
            setTyping(senderId, true);
        });

        socketService.on("stop_typing", (data: unknown) => {
            const { senderId } = data as { senderId: string };
            setTyping(senderId, false);
        });
    }
}));
