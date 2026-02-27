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
import { handleError } from "../utils/errorHandler.ts";

export class AdminController implements IAdminController {
  private adminService: IAdminService;

  constructor(adminService: IAdminService) {
    this.adminService = adminService;
  }

  getAllUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const queryDto = AdminUserQueryDto.parse(req.query);

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
      handleError(res, error);
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
      handleError(res, error);
    }
  };

  blockUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.adminService.blockUser(id);

      ApiResponse.success(res, user, Messages.USER_BLOCKED_SUCCESS);
    } catch (error: unknown) {
      handleError(res, error);
    }
  };

  unblockUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.adminService.unblockUser(id);

      ApiResponse.success(res, user, Messages.USER_UNBLOCKED_SUCCESS);
    } catch (error: unknown) {
      handleError(res, error);
    }
  };
}
