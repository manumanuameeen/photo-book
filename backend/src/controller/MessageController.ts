import { Request, Response, NextFunction } from "express";
import { IMessageService } from "../interfaces/services/IMessageService.ts";
import { HttpStatus } from "../constants/httpStatus.ts";
import { ApiResponse } from "../utils/response.ts";
import { AuthRequest } from "../middleware/authMiddleware.ts";
import { AppError } from "../utils/AppError.ts";
import { Messages } from "../constants/messages.ts";

import { IMessageController } from "../interfaces/controllers/IMessageController.ts";

export class MessageController implements IMessageController {
  private readonly _service: IMessageService;
  constructor(service: IMessageService) {
    this._service = service;
  }

  getMessages = async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const { partnerId } = req.params;
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      }
      if (!partnerId) {
        throw new AppError(Messages.PARTNER_ID_REQUIRED, HttpStatus.BAD_REQUEST);
      }
      const { page, limit } = req.query;
      const result = await this._service.getMessages(
        userId,
        partnerId,
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 50,
      );
      ApiResponse.success(res, result, Messages.MESSAGES_FETCHED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  getConversations = async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      }
      const conversations = await this._service.getConversations(userId);
      ApiResponse.success(res, conversations, "Conversations fetched successfully");
    } catch (error) {
      this._handleError(res, error);
    }
  };

  markAsRead = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this._service.markAsRead(id);
      ApiResponse.success(res, null, Messages.MESSAGE_MARKED_READ);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  deleteMessageForMe = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      await this._service.deleteMessageForMe(id, userId);
      ApiResponse.success(res, null, Messages.MESSAGE_DELETED_FOR_YOU);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  deleteMessageForEveryone = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      await this._service.deleteMessageForEveryone(id, userId);
      ApiResponse.success(res, null, Messages.MESSAGE_DELETED_FOR_EVERYONE);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  clearChat = async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const { partnerId } = req.params;
      const userId = req.user?.userId;
      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      if (!partnerId) throw new AppError(Messages.PARTNER_ID_REQUIRED, HttpStatus.BAD_REQUEST);
      await this._service.clearChat(userId, partnerId);
      ApiResponse.success(res, null, Messages.CHAT_CLEARED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  sendMessage = async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const { receiverId, content, attachment } = req.body;
      const senderId = req.user?.userId;
      if (!senderId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      if (!receiverId || !content)
        throw new AppError(Messages.RECEIVER_CONTENT_REQUIRED, HttpStatus.BAD_REQUEST);

      const message = await this._service.sendMessage(
        senderId,
        receiverId,
        content,
        attachment,
        req.body.replyToId,
      );
      ApiResponse.success(res, message, Messages.MESSAGE_SENT);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  editMessage = async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user?.userId;

      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      if (!content) throw new AppError(Messages.CONTENT_REQUIRED, HttpStatus.BAD_REQUEST);

      const message = await this._service.editMessage(id, userId, content);
      ApiResponse.success(res, message, Messages.MESSAGE_UPDATED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  toggleReaction = async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { emoji } = req.body;
      const userId = req.user?.userId;

      console.log("Toggle Reaction Request:", { id, emoji, userId, body: req.body });

      if (!userId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      if (!emoji) throw new AppError(Messages.EMOJI_REQUIRED, HttpStatus.BAD_REQUEST);

      const message = await this._service.toggleReaction(id, userId, emoji);
      ApiResponse.success(res, message, Messages.REACTION_TOGGLED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  uploadAttachment = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      console.log("Upload request received. File:", req.file ? "Present" : "Missing");
      if (req.file) {
        console.log("File details:", {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        });
      }
      if (!req.file) throw new AppError(Messages.NO_FILE_UPLOADED, HttpStatus.BAD_REQUEST);

      const { CloudinaryService } = await import("../services/external/CloudinaryService.ts");
      const fileService = new CloudinaryService();

      const url = await fileService.uploadFile(req.file);
      ApiResponse.success(res, { url }, Messages.FILE_UPLOADED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  private _handleError(res: Response, error: unknown): void {
    if (error instanceof AppError) {
      ApiResponse.error(res, error.message, error.statusCode as HttpStatus);
      return;
    }

    if (error instanceof Error) {
      ApiResponse.error(res, error.message, HttpStatus.BAD_REQUEST);
      return;
    }

    ApiResponse.error(res, Messages.INTERNAL_ERROR);
  }
}
