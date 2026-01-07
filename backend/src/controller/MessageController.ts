import { Request, Response, NextFunction } from "express";
import { IMessageService } from "../services/messaging/interface/IMessageService";
import { HttpStatus } from "../constants/httpStatus";
import { ApiResponse } from "../utils/response";
import { AuthRequest } from "../middleware/authMiddleware";
import { AppError } from "../utils/AppError";

export interface IMessageController {
    getMessages(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getSentMessages(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    markAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}

export class MessageController implements IMessageController {
    constructor(private readonly _service: IMessageService) { }

    getMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError("User not authenticated", HttpStatus.UNAUTHORIZED);
            }
            const messages = await this._service.getMessages(userId);
            ApiResponse.success(res, messages, "Messages fetched successfully");
        } catch (error) {
            this._handleError(res, error);
        }
    }

    getSentMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError("User not authenticated", HttpStatus.UNAUTHORIZED);
            }
            const messages = await this._service.getSentMessages(userId);
            ApiResponse.success(res, messages, "Sent messages fetched successfully");
        } catch (error) {
            this._handleError(res, error);
        }
    }

    markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            await this._service.markAsRead(id);
            ApiResponse.success(res, null, "Message marked as read");
        } catch (error) {
            this._handleError(res, error);
        }
    }

    deleteMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError("User not authenticated", HttpStatus.UNAUTHORIZED);
            }
            await this._service.deleteMessage(id, userId);
            ApiResponse.success(res, null, "Message deleted");
        } catch (error) {
            this._handleError(res, error);
        }
    }

    private _handleError(res: Response, error: unknown): void {
        if (error instanceof AppError) {
            ApiResponse.error(res, error.message, error.statusCode as HttpStatus);
            return;
        }

        if (error instanceof Error) {
            ApiResponse.error(res, error.message, HttpStatus.BAD_REQUEST);
            return;
        }

        ApiResponse.error(res, "Internal Server Error");
    }
}
