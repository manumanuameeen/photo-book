import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";

export interface IAdminDashboardController {
  getDashboardStats(req: AuthRequest, res: Response): Promise<void>;
}
