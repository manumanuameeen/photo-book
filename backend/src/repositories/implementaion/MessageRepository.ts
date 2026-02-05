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
        .find({ receiverId })
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
      this._model.countDocuments({ receiverId })
    ]);
    return { messages, total };
  }

  async findBySenderId(senderId: string, page = 1, limit = 10): Promise<{ messages: IMessage[]; total: number }> {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      this._model
        .find({ senderId })
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
      this._model.countDocuments({ senderId })
    ]);
    return { messages, total };
  }

  async getUnreadCount(receiverId: string): Promise<number> {
    return await this._model.countDocuments({ receiverId, isRead: false });
  }

  async markAsRead(messageId: string): Promise<IMessage | null> {
    return await this._model.findByIdAndUpdate(messageId, { isRead: true }, { new: true });
  }
}
