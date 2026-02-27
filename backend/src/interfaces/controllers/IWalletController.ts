import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware.ts";

export interface IWalletController {
  getWalletDetails(req: AuthRequest, res: Response): Promise<void>;
  getWalletTransactions(req: AuthRequest, res: Response): Promise<void>;
  getEscrowStats(req: AuthRequest, res: Response): Promise<void>;
  getDashboardStats(req: AuthRequest, res: Response): Promise<void>;
}
