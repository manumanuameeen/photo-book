import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware.ts";

export interface IMessageController {
  getMessages(req: AuthRequest, res: Response): Promise<void>;
  getSystemMessages(req: AuthRequest, res: Response): Promise<void>;
  getConversations(req: AuthRequest, res: Response): Promise<void>;
  markAsRead(req: Request, res: Response): Promise<void>;
  deleteMessageForMe(req: AuthRequest, res: Response): Promise<void>;
  deleteMessageForEveryone(req: AuthRequest, res: Response): Promise<void>;
  clearChat(req: AuthRequest, res: Response): Promise<void>;
  sendMessage(req: AuthRequest, res: Response): Promise<void>;
  editMessage(req: AuthRequest, res: Response): Promise<void>;
  toggleReaction(req: AuthRequest, res: Response): Promise<void>;
  uploadAttachment(req: Request, res: Response): Promise<void>;
}
