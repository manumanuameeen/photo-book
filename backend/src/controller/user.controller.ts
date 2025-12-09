import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/authMiddleware.ts";
import type { IUserController } from "../interfaces/user/IUserController.ts";
import type { IUserService } from "../services/user/user.service/IUserService.ts";
import { ApiResponse } from "../utils/response.ts";
import { HttpStatus } from "../constants/httpStatus.ts";
import { Messages } from "../constants/messages.ts";
import { AppError } from "../utils/AppError.ts";

export class UserController implements IUserController {
    private readonly _userService: IUserService;

    constructor(userService: IUserService) {
        this._userService = userService;
    }

    getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
            }

            const user = await this._userService.getProfile(userId);
            ApiResponse.success(res, user, "Profile fetched successfully");
        } catch (error: unknown) {
            this._handleError(res, error);
        }
    };

    UpdateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
            }

            const updatedUser = await this._userService.updateProfile(userId, req.body);
            ApiResponse.success(res, updatedUser, "Profile updated successfully");
        } catch (error: unknown) {
            this._handleError(res, error);
        }
    };

    changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
            }

            await this._userService.changePassword(userId, req.body);
            ApiResponse.success(res, null, Messages.PASSWORD_CHANGED);
        } catch (error: unknown) {
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
