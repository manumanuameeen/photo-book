import { Response, NextFunction, Request } from "express";
import { AuthRequest } from "../../middleware/authMiddleware.ts";

export interface IPhtogrpherController {
  apply(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getDashboardStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getPhotographers(req: Request, res: Response, next: NextFunction): Promise<void>;
  toggleLike(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
