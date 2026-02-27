import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware.ts";

export interface IHelpTopicRequestController {
  submitRequest(req: AuthRequest, res: Response): Promise<void>;
  getAllRequests(req: AuthRequest, res: Response): Promise<void>;
  updateStatus(req: AuthRequest, res: Response): Promise<void>;
}
