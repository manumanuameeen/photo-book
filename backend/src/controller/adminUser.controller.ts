import type { Request, Response } from "express";
import type { IAdminService } from "../services/admin/interface/IAdminService.ts";
import type { IAdminController } from "../interfaces/admin/IAdminController.ts";
import { z } from "zod";
import { AdminUserQueryDto } from "../dto/admin.dto.ts";
import { AdminMapper } from "../mappers/admin.mapper.ts";



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
      const result = await this.adminService.getAllUser(queryInput)
      // console.log("result. fro mcontroller:", result)
      res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: {
          users: result.users.map(AdminMapper.toUserResponse),
          pagination: {
            total: result.total,
            totalPages: result.totalPages,
            currentPage: result.currentPage

          },
        },
      });
    } catch (error: any) {
      console.error(" CONTROLLER ERROR:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  };

  getUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.adminService.getUser(id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: user,
      });
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  };

  blockUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.adminService.blockUser(id);

      res.status(200).json({
        success: true,
        message: "User blocked successfully",
        data: user,
      });
    } catch (error: any) {
      console.error("Error blocking user:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  };

  unblockUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.adminService.unblockUser(id);

      res.status(200).json({
        success: true,
        message: "User unblocked successfully",
        data: user,
      });
    } catch (error: any) {
      console.error("Error unblocking user:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  };
}
