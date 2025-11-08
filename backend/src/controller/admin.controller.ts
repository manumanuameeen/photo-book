import { Request, Response } from "express";
import type { IAdminService } from "../services/admin/IAdminService"
import { IAdminController } from "../interfaces/admin/IAdminController"



export class AdminController implements IAdminController {
    private adminService: IAdminService

    constructor(adminService: IAdminService) {
        this.adminService = adminService
    }

    async getAllUser(req: Request, res: Response): Promise<void> {
        try {

            const { page = 1, limit = 10, sort = "createdAt", search = "" } = req.params;
            const users = await this.adminService.getAllUser({
                page: Number(page),
                limit: Number(limit),
                sort: String(sort),
                search: String(search),
            })

            res.status(200).json(users);
        } catch (error: any) {
            res.status(500).json({ message: "Server Error :", error });
        }
    }

    async getUserId(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params._id
            const user = await this.adminService.getUserById(userId)
            if (!user) {
                res.status(404).json({ message: "User not found" })
                return;
            }
            res.status(200).json(user)
        } catch (error: any) {
            res.status(500).json({ message: "Server error :", error })
        }
    }

    async blockUser(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params._id
            const user = await this.adminService.blockUser(userId)
            res.status(200).json({ message: "User unblocked successfully", user });

        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }
    async unblockUser(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params._id;
            const user = await this.adminService.unblockUser(userId);
            res.status(200).json({ message: "User unblocked successfully", user });
        } catch (error) {
          res.status(500).json({ message: "Server error", error });
        }
    }
}

