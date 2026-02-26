export interface UserCompact {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    email: string;
    name?: string;
    role?: string;
}

export interface IMessage {
    _id: string;
    senderId: string | UserCompact;
    receiverId: string | UserCompact;
    content: string;
    attachment?: {
        url: string;
        type: 'image' | 'video' | 'file' | 'audio';
    };
    type: "DIRECT" | "SYSTEM";
    isRead: boolean;
    createdAt: string;
    status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
    replyTo?: IMessage | string;
    isDeleted?: boolean;
    isEdited?: boolean;
    reactions?: {
        emoji: string;
        userId: string;
    }[];
}
