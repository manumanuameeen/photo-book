import { IMessage } from "../../../model/messageModel";
import { IBaseRepository } from "./IBaseRepository";

export interface IMessageRepository extends IBaseRepository<IMessage> {
    findByReceiverId(receiverId: string): Promise<IMessage[]>;
    findBySenderId(senderId: string): Promise<IMessage[]>;
    getUnreadCount(receiverId: string): Promise<number>;
    markAsRead(messageId: string): Promise<IMessage | null>;
}
