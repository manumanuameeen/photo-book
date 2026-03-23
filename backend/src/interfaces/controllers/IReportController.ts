import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware.ts";

export interface IReportController {
  createReport(req: AuthRequest, res: Response): Promise<void>;
  getReports(req: Request, res: Response): Promise<void>;
  updateStatus(req: Request, res: Response): Promise<void>;
  forwardReport(req: AuthRequest, res: Response): Promise<void>;
  applyPenalty(req: AuthRequest, res: Response): Promise<void>;
  uploadEvidence(req: AuthRequest, res: Response): Promise<void>;
  getReportMessages(req: Request, res: Response): Promise<void>;
}
