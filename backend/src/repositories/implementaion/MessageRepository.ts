import mongoose from "mongoose";
import { MessageModel, IMessage } from "../../model/messageModel.ts";
import { BaseRepository } from "../base/BaseRepository.ts";
import { IMessageRepository } from "../../interfaces/repositories/IMessageRepository.ts";

export class MessageRepository extends BaseRepository<IMessage> implements IMessageRepository {
  constructor() {
    super(MessageModel);
  }

  async findByReceiverId(receiverId: string, page = 1, limit = 10): Promise<{ messages: IMessage[]; total: number }> {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      this._model
        .find({ receiverId, deletedFor: { $ne: receiverId } })
        .populate("senderId", "name role profileImage")
        .populate("receiverId", "name role profileImage")
        .populate({
          path: "replyTo",
          select: "content senderId attachment",
          populate: { path: "senderId", select: "name" }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this._model.countDocuments({ receiverId, deletedFor: { $ne: receiverId } })
    ]);
    return { messages, total };
  }

  async findBySenderId(senderId: string, page = 1, limit = 10): Promise<{ messages: IMessage[]; total: number }> {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      this._model
        .find({ senderId, deletedFor: { $ne: senderId } })
        .populate("senderId", "name role profileImage")
        .populate("receiverId", "name role profileImage")
        .populate({
          path: "replyTo",
          select: "content senderId attachment",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this._model.countDocuments({ senderId, deletedFor: { $ne: senderId } })
    ]);
    return { messages, total };
  }

  async getUnreadCount(receiverId: string): Promise<number> {
    return await this._model.countDocuments({ receiverId, isRead: false });
  }

  async markAsRead(messageId: string): Promise<IMessage | null> {
    return await this._model.findByIdAndUpdate(messageId, { isRead: true }, { new: true });
  }

  async clearChat(userId: string, partnerId: string): Promise<void> {
    const userObjId = new mongoose.Types.ObjectId(userId);
    await this._model.updateMany(
      {
        $or: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId }
        ],
        deletedFor: { $ne: userObjId }
      },
      { $addToSet: { deletedFor: userObjId } }
    );
  }

  async deleteForMe(messageId: string, userId: string): Promise<void> {
    const userObjId = new mongoose.Types.ObjectId(userId);
    await this._model.findByIdAndUpdate(messageId, {
      $addToSet: { deletedFor: userObjId }
    });
  }

  async toggleReaction(messageId: string, userId: string, emoji: string): Promise<IMessage | null> {
    const userObjId = new mongoose.Types.ObjectId(userId);
    const message = await this._model.findById(messageId);

    if (!message) return null;

    const existingReactionIndex = message.reactions?.findIndex(
      r => r.userId.toString() === userId
    ) ?? -1;

    if (existingReactionIndex >= 0) {
      
      if (message.reactions![existingReactionIndex].emoji === emoji) {
        
        message.reactions!.splice(existingReactionIndex, 1);
      } else {
        
        message.reactions![existingReactionIndex].emoji = emoji;
      }
    } else {
      
      if (!message.reactions) message.reactions = [];
      message.reactions.push({ emoji, userId: userObjId });
    }

    await message.save();
    return await this._model.findById(messageId)
      .populate("senderId", "name role profileImage")
      .populate("receiverId", "name role profileImage")
      .exec();
  }
}
