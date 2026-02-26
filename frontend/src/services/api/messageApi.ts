import apiClient from "../apiClient";
import { API_ROUTES } from "../../constants/apiRoutes";

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

interface RawSystemMessage {
    _id: string;
    content: string;
    type: 'SYSTEM' | 'CLIENT';
    isRead: boolean;
    senderId?: { name: string };
    receiverId?: { name: string };
    createdAt: string;
}

export const messageApi = {
    getMessages: async (page = 1, limit = 10): Promise<{ messages: SystemMessage[]; total: number }> => {
        const response = await apiClient.get(API_ROUTES.MESSAGE.BASE, { params: { page, limit } });
        const { messages, total } = response.data.data;
        return {
            messages: messages.map((msg: RawSystemMessage) => ({
                id: msg._id,
                content: msg.content,
                type: msg.type,
                isRead: msg.isRead,
                senderName: msg.senderId ? msg.senderId.name : "System",
                senderRole: "System",
                createdAt: msg.createdAt,
                fullDate: new Date(msg.createdAt).toLocaleString()
            })),
            total
        };
    },

    getSentMessages: async (page = 1, limit = 10): Promise<{ messages: SystemMessage[]; total: number }> => {
        const response = await apiClient.get(API_ROUTES.MESSAGE.SENT, { params: { page, limit } });
        const { messages, total } = response.data.data;
        return {
            messages: messages.map((msg: RawSystemMessage) => ({
                id: msg._id,
                content: msg.content,
                type: msg.type,
                isRead: msg.isRead,
                senderName: "You",
                senderRole: "You",
                createdAt: msg.createdAt,
                fullDate: new Date(msg.createdAt).toLocaleString(),
                receiverName: msg.receiverId ? msg.receiverId.name : "Unknown",
            })),
            total
        };
    },

    markAsRead: async (id: string): Promise<void> => {
        await apiClient.put(API_ROUTES.MESSAGE.READ(id));
    },

    deleteMessage: async (id: string): Promise<void> => {
        await apiClient.delete(API_ROUTES.MESSAGE.DELETE(id));
    },

    sendMessage: async (receiverId: string, content: string): Promise<void> => {
        await apiClient.post(API_ROUTES.MESSAGE.BASE, { receiverId, content });
    },

    getSystemMessages: async (page = 1, limit = 10): Promise<{ messages: SystemMessage[]; total: number }> => {
        return await messageApi.getMessages(page, limit);
    }
};
