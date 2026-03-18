import { Response, Request } from "express";
import { AuthRequest } from "../../middleware/authMiddleware.ts";

export interface IPhtogrpherController {
  apply(req: AuthRequest, res: Response): Promise<void>;
  getDashboardStats(req: AuthRequest, res: Response): Promise<void>;
  getPhotographers(req: Request, res: Response): Promise<void>;
  toggleLike(req: AuthRequest, res: Response): Promise<void>;
}
