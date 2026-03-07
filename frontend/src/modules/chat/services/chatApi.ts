import apiClient from "../../../services/apiClient";
import type { IMessage } from "../chat.types";

export const ChatApi = {
    getConversations: async (): Promise<unknown[]> => {
        const response = await apiClient.get('/message/conversations');
        return response.data.data;
    },

    getMessages: async (partnerId: string, page = 1, limit = 50): Promise<{ messages: IMessage[]; total: number }> => {
        const response = await apiClient.get(`/message/${partnerId}`, { params: { page, limit } });
        return response.data.data;
    },

    markAsRead: async (messageId: string): Promise<void> => {
        await apiClient.put(`/message/${messageId}/read`);
    },

    sendMessage: async (receiverId: string, content: string, attachment?: { url: string; type: string }, replyToId?: string): Promise<IMessage> => {
        const response = await apiClient.post('/message', { receiverId, content, attachment, replyToId });
        return response.data.data;
    },

    editMessage: async (messageId: string, content: string): Promise<IMessage> => {
        const response = await apiClient.put(`/message/${messageId}`, { content });
        return response.data.data;
    },

    deleteMessageForMe: async (messageId: string): Promise<void> => {
        await apiClient.delete(`/message/${messageId}`);
    },

    deleteMessageForEveryone: async (messageId: string): Promise<void> => {
        await apiClient.delete(`/message/${messageId}/everyone`);
    },

    clearChat: async (partnerId: string): Promise<void> => {
        await apiClient.delete(`/message/clear/${partnerId}`);
    },

    toggleReaction: async (messageId: string, emoji: string): Promise<IMessage> => {
        console.log("Calling toggleReaction API:", { messageId, emoji });
        const response = await apiClient.patch(`/message/${messageId}/reaction`, { emoji });
        console.log("toggleReaction response:", response.data);
        return response.data.data;
    },

    uploadFile: async (file: File): Promise<{ url: string; type: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post('/message/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data.data;
    }
};
