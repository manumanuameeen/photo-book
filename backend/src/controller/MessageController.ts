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
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      }
      const messages = await this._service.getMessages(userId);
      ApiResponse.success(res, messages, Messages.MESSAGES_FETCHED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  getSentMessages = async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      }
      const messages = await this._service.getSentMessages(userId);
      ApiResponse.success(res, messages, Messages.SENT_MESSAGES_FETCHED);
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

  deleteMessage = async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      }
      await this._service.deleteMessage(id, userId);
      ApiResponse.success(res, null, Messages.MESSAGE_DELETED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  sendMessage = async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const { receiverId, content } = req.body;
      const senderId = req.user?.userId;
      if (!senderId) throw new AppError(Messages.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED);
      if (!receiverId || !content)
        throw new AppError("Receiver and content are required", HttpStatus.BAD_REQUEST);

      const message = await this._service.sendMessage(senderId, receiverId, content);
      ApiResponse.success(res, message, "Message sent successfully");
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
