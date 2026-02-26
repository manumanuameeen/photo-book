import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware.ts";

export interface IAdminDashboardController {
  getDashboardStats(req: AuthRequest, res: Response): Promise<void>;
}
