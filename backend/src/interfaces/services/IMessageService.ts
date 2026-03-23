import { IMessage } from "../../models/message.model";

export interface IMessageService {
  sendSystemMessage(
    receiverId: string,
    content: string,
    senderId?: string,
    reportId?: string,
  ): Promise<IMessage>;
  getMessages(
    userId: string,
    partnerId: string,
    page?: number,
    limit?: number,
  ): Promise<{ messages: IMessage[]; total: number }>;
  getSystemMessages(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<{ messages: IMessage[]; total: number }>;
  getConversations(userId: string): Promise<Record<string, unknown>[]>;
  getMessagesByReportId(reportId: string): Promise<IMessage[]>;
  markAsRead(messageId: string): Promise<IMessage | null>;
  clearChat(userId: string, partnerId: string): Promise<void>;
  deleteMessageForMe(messageId: string, userId: string): Promise<boolean>;
  deleteMessageForEveryone(messageId: string, userId: string): Promise<boolean>;
  sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
    attachment?: { url: string; type: "image" | "video" | "file" | "audio" },
    replyToId?: string,
  ): Promise<IMessage>;
  editMessage(messageId: string, userId: string, newContent: string): Promise<IMessage | null>;
  toggleReaction(messageId: string, userId: string, emoji: string): Promise<IMessage | null>;
}
