import { IMessage } from "../../model/messageModel.ts";
import { IBaseRepository } from "./IBaseRepository.ts";

export interface IMessageRepository extends IBaseRepository<IMessage> {
  findByPartnerId(
    userId: string,
    partnerId: string,
    page?: number,
    limit?: number,
  ): Promise<{ messages: IMessage[]; total: number }>;
  getConversations(userId: string): Promise<Record<string, unknown>[]>;
  findByReportId(reportId: string): Promise<IMessage[]>;
  getUnreadCount(receiverId: string): Promise<number>;
  markAsRead(messageId: string): Promise<IMessage | null>;
  clearChat(userId: string, partnerId: string): Promise<void>;
  deleteForMe(messageId: string, userId: string): Promise<void>;
  toggleReaction(messageId: string, userId: string, emoji: string): Promise<IMessage | null>;
}
