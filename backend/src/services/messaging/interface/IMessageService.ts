import { IMessage } from "../../../model/messageModel";

export interface IMessageService {
    sendSystemMessage(receiverId: string, content: string, senderId?: string): Promise<IMessage>;
    getMessages(receiverId: string): Promise<IMessage[]>;
    getSentMessages(senderId: string): Promise<IMessage[]>;
    markAsRead(messageId: string): Promise<void>;
    deleteMessage(messageId: string, userId: string): Promise<boolean>;
}
