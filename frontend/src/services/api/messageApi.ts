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
        const response = await apiClient.get("/messages");
        const messages = response.data.data;
        return messages.map((msg: any) => ({
            id: msg._id,
            content: msg.content,
            type: msg.type,
            isRead: msg.isRead,
            senderName: msg.senderId ? msg.senderId.name : "System",
            senderRole: "System",
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
            receiverName: msg.receiverId ? msg.receiverId.name : "Unknown",
        }));
    },

    markAsRead: async (id: string): Promise<void> => {
        await apiClient.put(`/messages/${id}/read`);
    },

    deleteMessage: async (id: string): Promise<void> => {
        await apiClient.delete(`/messages/${id}`);
    },

    sendMessage: async (receiverId: string, content: string): Promise<void> => {
        await apiClient.post("/messages", { receiverId, content });
    },

    getSystemMessages: async (): Promise<SystemMessage[]> => {
        return await messageApi.getMessages();
    }
};
