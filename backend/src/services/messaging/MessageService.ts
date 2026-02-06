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

    const savedMessage = await this._repository.create(messageData);

    
    try {
      const populatedMessage = await savedMessage.populate([
        { path: "senderId", select: "name role profileImage" },
        { path: "receiverId", select: "name role profileImage" }
      ]);
      const { SocketService } = await import("./SocketService.ts");
      SocketService.getInstance().emitToUser(receiverId, "new_message", populatedMessage);
      return populatedMessage;
    } catch (e) {
      console.error("Socket emit failed for system message", e);
      return savedMessage;
    }
  }

  async getSentMessages(senderId: string, page = 1, limit = 10): Promise<{ messages: IMessage[]; total: number }> {
    return await this._repository.findBySenderId(senderId, page, limit);
  }

  async getMessages(receiverId: string, page = 1, limit = 10): Promise<{ messages: IMessage[]; total: number }> {
    
    return await this._repository.findByReceiverId(receiverId, page, limit);
  }

  async markAsRead(messageId: string): Promise<IMessage | null> {
    const message = await this._repository.markAsRead(messageId);
    if (message && message.senderId) {
      try {
        const { SocketService } = await import("./SocketService.ts");
        const senderIdRaw = message.senderId;
        const senderId = typeof senderIdRaw === "object" ? (senderIdRaw as any)._id : senderIdRaw;
        SocketService.getInstance().emitToUser(senderId.toString(), "message_read", message);
      } catch (e) {
        console.error("Socket emit message_read failed", e);
      }
    }
    return message;
  }

  async deleteMessageForMe(messageId: string, userId: string): Promise<boolean> {
    await this._repository.deleteForMe(messageId, userId);
    return true;
  }

  async deleteMessageForEveryone(messageId: string, userId: string): Promise<boolean> {
    const message = await this._repository.findById(messageId);
    if (!message) throw new Error("Message not found");

    const senderIdRaw = message.senderId;
    if (!senderIdRaw) throw new AppError("System messages cannot be deleted for everyone", 400);

    const senderId = typeof senderIdRaw === "object" && senderIdRaw !== null && "_id" in senderIdRaw
      ? (senderIdRaw as any)._id.toString()
      : String(senderIdRaw);

    if (senderId !== userId) {
      throw new AppError("Only the sender can delete this message for everyone", 403);
    }

    const diff = new Date().getTime() - new Date(message.createdAt).getTime();
    if (diff > 3600000) {
      throw new AppError("Message deletion limit exceeded (1 hour)", 403);
    }

    message.isDeleted = true;
    message.content = "This message was deleted";
    message.attachment = undefined;
    await message.save();

    try {
      const { SocketService } = await import("./SocketService.ts");
      const receiverIdRaw = message.receiverId;
      const receiverId = typeof receiverIdRaw === "object" && receiverIdRaw !== null && "_id" in receiverIdRaw
        ? (receiverIdRaw as any)._id.toString()
        : String(receiverIdRaw);
      SocketService.getInstance().emitToUser(receiverId, "message_updated", message);
      SocketService.getInstance().emitToUser(senderId, "message_updated", message);
    } catch (e) {
      console.error("Socket emit failed", e);
    }

    return true;
  }

  async clearChat(userId: string, partnerId: string): Promise<void> {
    await this._repository.clearChat(userId, partnerId);
  }

  
  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    return this.deleteMessageForEveryone(messageId, userId);
  }

  async editMessage(messageId: string, userId: string, newContent: string): Promise<IMessage | null> {
    const message = await this._repository.findById(messageId);
    if (!message) throw new Error("Message not found");

    const senderIdRaw = message.senderId;
    if (!senderIdRaw) throw new AppError("System messages cannot be edited", 400);

    const senderId = typeof senderIdRaw === "object" && senderIdRaw !== null && "_id" in senderIdRaw
      ? (senderIdRaw as any)._id.toString()
      : String(senderIdRaw);
    if (senderId !== userId) {
      throw new AppError("Only the sender can edit this message", 403);
    }

    if (message.isDeleted) throw new AppError("Cannot edit a deleted message", 400);

    message.content = newContent;
    message.isEdited = true;
    await message.save();

    
    try {
      const { SocketService } = await import("./SocketService.ts");
      const receiverIdRaw = message.receiverId;
      const receiverId = typeof receiverIdRaw === "object" && receiverIdRaw !== null && "_id" in receiverIdRaw
        ? (receiverIdRaw as any)._id.toString()
        : String(receiverIdRaw);
      SocketService.getInstance().emitToUser(receiverId, "message_updated", message);
    } catch (e) {
      console.error("Socket emit failed", e);
    }

    return message;
  }

  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
    attachment?: { url: string; type: "image" | "video" | "file" | "audio" },
    replyToId?: string,
    type: "DIRECT" | "SYSTEM" = "DIRECT"
  ): Promise<IMessage> {
    const messageData: Partial<IMessage> = {
      senderId: new mongoose.Types.ObjectId(senderId),
      receiverId: new mongoose.Types.ObjectId(receiverId),
      content,
      attachment,
      type,
      isRead: false,
    };

    if (replyToId) {
      messageData.replyTo = new mongoose.Types.ObjectId(replyToId);
    }

    const savedMessage = await this._repository.create(messageData);

    
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

  async toggleReaction(messageId: string, userId: string, emoji: string): Promise<IMessage | null> {
    const updatedMessage = await this._repository.toggleReaction(messageId, userId, emoji);

    if (updatedMessage) {
      try {
        const { SocketService } = await import("./SocketService.ts");
        const receiverIdRaw = updatedMessage.receiverId;
        const receiverId = typeof receiverIdRaw === "object" && receiverIdRaw !== null && "_id" in receiverIdRaw
          ? (receiverIdRaw as any)._id.toString()
          : String(receiverIdRaw);

        const senderIdRaw = updatedMessage.senderId;
        const senderId = senderIdRaw && typeof senderIdRaw === "object" && "_id" in senderIdRaw
          ? (senderIdRaw as any)._id.toString()
          : String(senderIdRaw);

        SocketService.getInstance().emitToUser(receiverId, "message_updated", updatedMessage);
        if (senderId) {
          SocketService.getInstance().emitToUser(senderId, "message_updated", updatedMessage);
        }
      } catch (e) {
        console.error("Socket emit failed", e);
      }
    }

    return updatedMessage;
  }
}
