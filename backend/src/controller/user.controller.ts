import type { IUserSerivice } from "../services/user/user.service/IUserService.ts";
import { IUserController } from "../interfaces/user/IUserController.ts";
import type { NextFunction, Response } from "express";
import { ApiResponse } from "../utils/response.ts";
import { Messages } from "constants/messages.ts";
import { HttpStatus } from "constants/httpStatus.ts";
import { ChangePasswordDto, UpdateProfileDto } from "dto/user.dto.ts";
import { AppError } from "utils/AppError.ts";
import type { AuthRequest } from "../middleware/authMiddleware.ts";

export class UserController implements IUserController {
  private readonly _userService: IUserSerivice;

  constructor(userService: IUserSerivice) {
    this._userService = userService;
  }

  getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        ApiResponse.error(res, Messages.VERIFY_FIRST, HttpStatus.UNAUTHORIZED);
        return;
      }

      const data = await this._userService.getProfile(userId);
      ApiResponse.success(res, data, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  UpdateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        next(new AppError(Messages.VERIFY_FIRST, HttpStatus.UNAUTHORIZED));
        return;
      }
      // uploadedUrls = await this._fileService.uploadMultipleFiles(files, "user", userId);

      const input = UpdateProfileDto.parse(req.body);
      const result = await this._userService.updateProfile(userId, input);
      ApiResponse.success(res, result, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        next(new AppError(Messages.VERIFY_FIRST, HttpStatus.UNAUTHORIZED));
        return;
      }

      const input = ChangePasswordDto.parse(req.body);
      await this._userService.changePassword(userId, input);
      ApiResponse.success(res, null, Messages.PASSWORD_CHANGED, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}
