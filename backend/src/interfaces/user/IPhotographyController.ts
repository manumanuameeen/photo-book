import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";

export interface IPhtogrpherController {
  apply(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
