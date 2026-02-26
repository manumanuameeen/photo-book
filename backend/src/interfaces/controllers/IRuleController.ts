import { Request, Response, NextFunction } from "express";

export interface IRuleController {
  createRule(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllRules(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateRule(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteRule(req: Request, res: Response, next: NextFunction): Promise<void>;
}
