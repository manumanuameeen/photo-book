import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/authMiddleware.ts";

export interface IReportController {
  createReport(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void | Response>;
  getReports(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | Response>;
  updateStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | Response>;
  forwardReport(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void | Response>;
  applyPenalty(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void | Response>;
  uploadEvidence(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void | Response>;
  getReportMessages(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | Response>;
}
