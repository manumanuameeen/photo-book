import mongoose from "mongoose";
import { MessageModel, IMessage } from "../../model/messageModel.ts";
import { BaseRepository } from "../base/BaseRepository.ts";
import { IMessageRepository } from "../../interfaces/repositories/IMessageRepository.ts";

export class MessageRepository extends BaseRepository<IMessage> implements IMessageRepository {
  constructor() {
    super(MessageModel);
  }

  async findByPartnerId(
    userId: string,
    partnerId: string,
    page = 1,
    limit = 50,
  ): Promise<{ messages: IMessage[]; total: number }> {
    const skip = (page - 1) * limit;
    const userObjId = new mongoose.Types.ObjectId(userId);
    const partnerObjId = new mongoose.Types.ObjectId(partnerId);

    const query = {
      $or: [
        { senderId: userObjId, receiverId: partnerObjId },
        { senderId: partnerObjId, receiverId: userObjId },
      ],
      deletedFor: { $ne: userObjId },
    };

    const [messages, total] = await Promise.all([
      this._model
        .find(query)
        .populate("senderId", "name role profileImage")
        .populate("receiverId", "name role profileImage")
        .populate({
          path: "replyTo",
          select: "content senderId attachment",
          populate: { path: "senderId", select: "name" },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this._model.countDocuments(query),
    ]);
    return { messages, total };
  }

  async getSystemMessages(
    userId: string,
    page = 1,
    limit = 50,
  ): Promise<{ messages: IMessage[]; total: number }> {
    const skip = (page - 1) * limit;
    const userObjId = new mongoose.Types.ObjectId(userId);

    const query = {
      receiverId: userObjId,
      type: "SYSTEM",
      deletedFor: { $ne: userObjId },
    };

    const [messages, total] = await Promise.all([
      this._model
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this._model.countDocuments(query),
    ]);
    return { messages, total };
  }

  async getConversations(userId: string): Promise<Record<string, unknown>[]> {
    const userObjId = new mongoose.Types.ObjectId(userId);

    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          deletedFor: { $ne: userObjId },
          $and: [
            { $or: [{ senderId: userObjId }, { receiverId: userObjId }] },
            {
              $or: [{ type: "DIRECT" }, { type: "SYSTEM", senderId: { $exists: true, $ne: null } }],
            },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$senderId", userObjId] },
              then: "$receiverId",
              else: "$senderId",
            },
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [{ $eq: ["$receiverId", userObjId] }, { $eq: ["$isRead", false] }],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "partner",
        },
      },
      {
        $unwind: { path: "$partner", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          partner: {
            _id: 1,
            name: 1,
            profileImage: 1,
            role: 1,
          },
          lastMessage: 1,
          unreadCount: 1,
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 as -1 | 1 },
      },
    ];

    return await this._model.aggregate(pipeline).exec();
  }

  async findByReportId(reportId: string): Promise<IMessage[]> {
    return await this._model
      .find({ reportId })
      .populate("senderId", "name role profileImage")
      .populate("receiverId", "name role profileImage")
      .populate({
        path: "replyTo",
        select: "content senderId attachment",
      })
      .sort({ createdAt: 1 })
      .exec();
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
          { senderId: partnerId, receiverId: userId },
        ],
        deletedFor: { $ne: userObjId },
      },
      { $addToSet: { deletedFor: userObjId } },
    );
  }

  async deleteForMe(messageId: string, userId: string): Promise<void> {
    const userObjId = new mongoose.Types.ObjectId(userId);
    await this._model.findByIdAndUpdate(messageId, {
      $addToSet: { deletedFor: userObjId },
    });
  }

  async toggleReaction(messageId: string, userId: string, emoji: string): Promise<IMessage | null> {
    const userObjId = new mongoose.Types.ObjectId(userId);
    const message = await this._model.findById(messageId);

    if (!message) return null;

    const existingReactionIndex =
      message.reactions?.findIndex((r) => r.userId.toString() === userId) ?? -1;

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
    return await this._model
      .findById(messageId)
      .populate("senderId", "name role profileImage")
      .populate("receiverId", "name role profileImage")
      .exec();
  }
}
