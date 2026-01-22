import { IMessageRepository } from "../../interfaces/repositories/IMessageRepository.ts";
import { IMessageService } from "../../interfaces/services/IMessageService.ts";
import { IMessage } from "../../model/messageModel.ts";
import mongoose from "mongoose";

export class MessageService implements IMessageService {
  private readonly _repository: IMessageRepository;
  constructor(repository: IMessageRepository) {
    this._repository = repository;
  }

  async sendSystemMessage(
    receiverId: string,
    content: string,
    senderId?: string,
  ): Promise<IMessage> {
    return await this._repository.create({
      senderId: senderId ? new mongoose.Types.ObjectId(senderId) : undefined,
      receiverId: new mongoose.Types.ObjectId(receiverId),
      content,
      type: "SYSTEM",
      isRead: false,
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

    if (message.receiverId.toString() !== userId) {
      throw new Error("Unauthorized to delete this message");
    }

    if (this._repository.delete) {
      return await this._repository.delete(messageId);
    }
    return false;
  }
  async sendMessage(senderId: string, receiverId: string, content: string): Promise<IMessage> {
    return await this._repository.create({
      senderId: new mongoose.Types.ObjectId(senderId),
      receiverId: new mongoose.Types.ObjectId(receiverId),
      content,
      type: "USER",
      isRead: false,
    } as any);
  }
}
