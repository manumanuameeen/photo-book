import { IMessageRepository } from "../../../repositories/interface/IMessageRepository";
import { IMessageService } from "./interface/IMessageService";
import { IMessage } from "../../../model/messageModel";
import mongoose from "mongoose";

export class MessageService implements IMessageService {
    constructor(private readonly _repository: IMessageRepository) { }

    async sendSystemMessage(receiverId: string, content: string, senderId?: string): Promise<IMessage> {
        return await this._repository.create({
            senderId: senderId ? new mongoose.Types.ObjectId(senderId) : undefined,
            receiverId: new mongoose.Types.ObjectId(receiverId),
            content,
            type: 'SYSTEM',
            isRead: false
        } as any);
    }

    async getSentMessages(senderId: string): Promise<IMessage[]> {
        return await this._repository.findBySenderId(senderId);
    }

    async getMessages(receiverId: string): Promise<IMessage[]> {
        return await this._repository.findByReceiverId(receiverId);
    }

    async markAsRead(messageId: string): Promise<void> {
        await this._repository.markAsRead(messageId);
    }

    async deleteMessage(messageId: string, userId: string): Promise<boolean> {
        const message = await this._repository.findById(messageId);
        if (!message) throw new Error("Message not found");

        // Ensure user owns the message (receiver) or is admin? 
        // For now, only receiver can delete their messages.
        if (message.receiverId.toString() !== userId) {
            throw new Error("Unauthorized to delete this message");
        }

        if (this._repository.delete) {
            return await this._repository.delete(messageId);
        }
        return false;
    }
}
