import { IMessageRepository } from "../../interfaces/repositories/IMessageRepository.ts";
import { IMessageService } from "../../interfaces/services/IMessageService.ts";
import { IMessage } from "../../model/messageModel.ts";
import mongoose from "mongoose";
import { AppError } from "../../utils/AppError.ts";

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
    const messageData: Partial<IMessage> = {
      receiverId: new mongoose.Types.ObjectId(receiverId),
      content,
      type: "SYSTEM",
      isRead: false,
    };

    if (senderId) {
      messageData.senderId = new mongoose.Types.ObjectId(senderId);
    }

    return await this._repository.create(messageData);
  }

  async getSentMessages(senderId: string, page = 1, limit = 10): Promise<{ messages: IMessage[]; total: number }> {
    return await this._repository.findBySenderId(senderId, page, limit);
  }

  async getMessages(receiverId: string, page = 1, limit = 10): Promise<{ messages: IMessage[]; total: number }> {
    // Repository now handles full population
    return await this._repository.findByReceiverId(receiverId, page, limit);
  }

  async markAsRead(messageId: string): Promise<void> {
    const message = await this._repository.markAsRead(messageId);
    if (message) {
      try {
        const { SocketService } = await import("./SocketService.ts");
        const senderId = typeof message.senderId === 'object' ? (message.senderId as any)._id : message.senderId;
        SocketService.getInstance().emitToUser(senderId.toString(), "message_read", message);
      } catch (e) {
        console.error("Socket emit message_read failed", e);
      }
    }
  }

  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    const message = await this._repository.findById(messageId);
    if (!message) throw new Error("Message not found");

    // Allow deleting if I am the sender (soft delete)
    // Or if I am receiver (maybe just hide? but prompt said 'delete like whatsapp')
    // WhatsApp allows 'delete for me' (local) and 'delete for everyone' (sender only, within time limit).
    // Here we implement 'Delete for Everyone' which requires Sender check.

    // Check if user is the sender
    const senderId = typeof message.senderId === 'object' ? (message.senderId as any)._id.toString() : message.senderId.toString();

    if (senderId !== userId) {
      // If not sender, maybe we can delete "for me" but backend usually just soft-deletes or clears content?
      // For simplicity, we restrict "Delete" (presumably for everyone) to the Sender.
      throw new AppError("Only the sender can delete this message", 403);
    }

    // Soft Delete
    message.isDeleted = true;
    message.content = "This message was deleted";
    message.attachment = undefined; // Remove attachment
    await message.save();

    // Notify receiver
    try {
      const { SocketService } = await import("./SocketService.ts");
      const receiverId = typeof message.receiverId === 'object' ? (message.receiverId as any)._id.toString() : message.receiverId.toString();
      SocketService.getInstance().emitToUser(receiverId, "message_updated", message);
    } catch (e) { console.error("Socket emit failed", e); }

    return true;
  }

  async editMessage(messageId: string, userId: string, newContent: string): Promise<IMessage | null> {
    const message = await this._repository.findById(messageId);
    if (!message) throw new Error("Message not found");

    const senderId = typeof message.senderId === 'object' ? (message.senderId as any)._id.toString() : message.senderId.toString();
    if (senderId !== userId) {
      throw new AppError("Only the sender can edit this message", 403);
    }

    if (message.isDeleted) throw new AppError("Cannot edit a deleted message", 400);

    message.content = newContent;
    message.isEdited = true;
    await message.save();

    // Notify receiver
    try {
      const { SocketService } = await import("./SocketService.ts");
      const receiverId = typeof message.receiverId === 'object' ? (message.receiverId as any)._id.toString() : message.receiverId.toString();
      SocketService.getInstance().emitToUser(receiverId, "message_updated", message);
    } catch (e) { console.error("Socket emit failed", e); }

    return message;
  }

  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
    attachment?: { url: string; type: "image" | "video" | "file" | "audio" },
    replyToId?: string
  ): Promise<IMessage> {
    const messageData: Partial<IMessage> = {
      senderId: new mongoose.Types.ObjectId(senderId),
      receiverId: new mongoose.Types.ObjectId(receiverId),
      content,
      attachment,
      type: "DIRECT",
      isRead: false,
    };

    if (replyToId) {
      messageData.replyTo = new mongoose.Types.ObjectId(replyToId);
    }

    const savedMessage = await this._repository.create(messageData);

    // Emit real-time event
    try {
      const populatedMessage = await savedMessage.populate([
        { path: "senderId", select: "name role profileImage" },
        { path: "receiverId", select: "name role profileImage" },
        { path: "replyTo", select: "content senderId attachment" }
      ]);
      const { SocketService } = await import("./SocketService.ts");
      SocketService.getInstance().emitToUser(receiverId, "new_message", populatedMessage);
      return populatedMessage;
    } catch (e) {
      console.error("Socket emit failed", e);
      return savedMessage;
    }
  }
}
