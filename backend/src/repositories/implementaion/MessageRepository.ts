import { MessageModel, IMessage } from "../../model/messageModel";
import { BaseRepository } from "../base/BaseRepository";
import { IMessageRepository } from "../interface/IMessageRepository";

export class MessageRepository extends BaseRepository<IMessage> implements IMessageRepository {
    constructor() {
        super(MessageModel);
    }

    async findByReceiverId(receiverId: string): Promise<IMessage[]> {
        return await this._model.find({ receiverId })
            .populate("senderId", "name role")
            .sort({ createdAt: -1 })
            .limit(20);
    }

    async findBySenderId(senderId: string): Promise<IMessage[]> {
        return await this._model.find({ senderId })
            .populate("receiverId", "name role") // Populate receiver info
            .sort({ createdAt: -1 })
            .limit(20);
    }

    async getUnreadCount(receiverId: string): Promise<number> {
        return await this._model.countDocuments({ receiverId, isRead: false });
    }

    async markAsRead(messageId: string): Promise<IMessage | null> {
        return await this._model.findByIdAndUpdate(messageId, { isRead: true }, { new: true });
    }
}
