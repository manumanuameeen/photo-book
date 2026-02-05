import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/authMiddleware.ts";
import type { IUserController } from "../interfaces/user/IUserController.ts";
import type { IUserService } from "../interfaces/services/IUserService.ts";
import { UpdateProfileDtoType, ChangePasswordDtoType } from "../dto/user.dto.ts";
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
      ApiResponse.success(res, user, Messages.PROFILE_FETCHED);
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

      const updatedUser = await this._userService.updateProfile(userId, req.body as UpdateProfileDtoType);
      ApiResponse.success(res, updatedUser, Messages.PROFILE_UPDATED);
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

      await this._userService.changePassword(userId, req.body as ChangePasswordDtoType);
      ApiResponse.success(res, null, Messages.PASSWORD_CHANGED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  initiateChangePassword = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      await this._userService.initiateChangePassword(userId);
      ApiResponse.success(res, null, Messages.OTP_SENT);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  uploadProfileImage = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      if (!req.file) {
        throw new AppError(Messages.NO_IMAGE_FILE_PROVIDED, HttpStatus.BAD_REQUEST);
      }

      const imageUrl = await this._userService.uploadProfileImage(userId, req.file);
      ApiResponse.success(res, { imageUrl }, Messages.PROFILE_IMAGE_UPLOADED);
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

  verifyOtp = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      const { otp } = req.body;
      if (!otp) {
        throw new AppError(Messages.INVALID_OTP, HttpStatus.BAD_REQUEST);
      }

      await this._userService.verifyOtp(userId, otp);
      ApiResponse.success(res, null, Messages.OTP_VERIFIED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };
}
