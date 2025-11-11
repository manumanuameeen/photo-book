import type { Request, Response } from "express";
import type { IAdminService } from "../services/admin/interface/IAdminService";
import type { IAdminController } from "../interfaces/admin/IAdminController";

export class AdminController implements IAdminController {
  private adminService: IAdminService;

  constructor(adminService: IAdminService) {
    this.adminService = adminService;
  }

  getAllUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = "1", limit = "10", sort = "createdAt", search = "" } = req.query;

      const users = await this.adminService.getAllUser({
        page: Number(page),
        limit: Number(limit),
        sort: String(sort),
        search: String(search),
      });

      res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        users: users,
      });
    } catch (error: any) {
      console.error(" CONTROLLER ERROR:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  };

  getUserId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.adminService.getUserById(id);

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
