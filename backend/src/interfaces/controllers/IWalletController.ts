import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware.ts";

export interface IWalletController {
  getWalletDetails(req: AuthRequest, res: Response, next?: NextFunction): Promise<void>;
  getWalletTransactions(req: AuthRequest, res: Response, next?: NextFunction): Promise<void>;
  getEscrowStats(req: AuthRequest, res: Response, next?: NextFunction): Promise<void>;
  getDashboardStats(req: AuthRequest, res: Response, next?: NextFunction): Promise<void>;
}
