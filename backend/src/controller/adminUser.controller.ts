import type { Request, Response } from "express";
import type { IAdminService } from "../interfaces/services/IAdminService.ts";
import type { IAdminController } from "../interfaces/admin/IAdminController.ts";
import { z } from "zod";
import { AdminUserQueryDto } from "../dto/admin.dto.ts";
import { AdminMapper } from "../mappers/admin.mapper.ts";
import { ApiResponse } from "../utils/response.ts";
import { Messages } from "../constants/messages.ts";
import { AppError } from "../utils/AppError.ts";
import { HttpStatus } from "../constants/httpStatus.ts";

export class AdminController implements IAdminController {
  private adminService: IAdminService;

  constructor(adminService: IAdminService) {
    this.adminService = adminService;
  }

  private _validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
  }

  getAllUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const queryDto = this._validate(AdminUserQueryDto, req.query);

      const queryInput = AdminMapper.toQueryInput(queryDto);
      const result = await this.adminService.getAllUser(queryInput);

      const responseData = {
        users: result.users,
        pagination: {
          total: result.total,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        },
      };

      ApiResponse.success(res, responseData, Messages.USERS_FETCHED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  getUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.adminService.getUser(id);

      if (!user) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      ApiResponse.success(res, user, Messages.USER_FETCHED);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  blockUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.adminService.blockUser(id);

      ApiResponse.success(res, user, Messages.USER_BLOCKED_SUCCESS);
    } catch (error: unknown) {
      this._handleError(res, error);
    }
  };

  unblockUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.adminService.unblockUser(id);

      ApiResponse.success(res, user, Messages.USER_UNBLOCKED_SUCCESS);
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
