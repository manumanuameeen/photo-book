import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/authMiddleware.ts";

export interface IPhtogrpherController {
  apply(req: any, res: any, next: any): Promise<void>;
  getDashboardStats(req: any, res: any, next: any): Promise<void>;
  getPhotographers(req: any, res: any, next: any): Promise<void>;
  toggleLike(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
