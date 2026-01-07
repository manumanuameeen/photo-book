import apiClient from "../apiClient";

export interface SystemMessage {
    id: string;
    content: string;
    type: 'SYSTEM' | 'CLIENT';
    isRead: boolean;
    senderName?: string;
    senderRole?: string;
    createdAt: string;
    fullDate?: string;
    receiverName?: string;
}

export const messageApi = {
    getMessages: async (): Promise<SystemMessage[]> => {
        const response = await apiClient.get("/messages"); // Updated endpoint
        const messages = response.data.data;
        return messages.map((msg: any) => ({
            id: msg._id,
            content: msg.content,
            type: msg.type,
            isRead: msg.isRead,
            senderName: msg.senderId ? msg.senderId.name : "System", // simplistic mapping
            senderRole: "System", // Defaulting for now
            createdAt: msg.createdAt,
            fullDate: new Date(msg.createdAt).toLocaleString()
        }));
    },

    getSentMessages: async (): Promise<SystemMessage[]> => {
        const response = await apiClient.get("/messages/sent");
        const messages = response.data.data;
        return messages.map((msg: any) => ({
            id: msg._id,
            content: msg.content,
            type: msg.type,
            isRead: msg.isRead,
            senderName: "You",
            senderRole: "You",
            createdAt: msg.createdAt,
            fullDate: new Date(msg.createdAt).toLocaleString(),
            receiverName: msg.receiverId ? msg.receiverId.name : "Unknown", // for sent items
        }));
    },

    markAsRead: async (id: string): Promise<void> => {
        await apiClient.put(`/messages/${id}/read`);
    },

    deleteMessage: async (id: string): Promise<void> => {
        await apiClient.delete(`/messages/${id}`);
    },

    // Legacy or specific usage might still need this? 
    // If dashboard stats still returns recentMessages, we can keep it or replace usage.
    // For now, let's assume we are switching to the new API for the message box.
    getSystemMessages: async (): Promise<SystemMessage[]> => {
        return await messageApi.getMessages();
    }
};
