import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/authMiddleware.ts";

export interface IMessageController {
  getMessages(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getConversations(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  markAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteMessageForMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  deleteMessageForEveryone(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  clearChat(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  sendMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  editMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  toggleReaction(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  uploadAttachment(req: Request, res: Response, next: NextFunction): Promise<void>;
}
