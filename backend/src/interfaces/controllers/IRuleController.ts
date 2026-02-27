import { Request, Response } from "express";

export interface IRuleController {
  createRule(req: Request, res: Response): Promise<void>;
  getAllRules(req: Request, res: Response): Promise<void>;
  updateRule(req: Request, res: Response): Promise<void>;
  deleteRule(req: Request, res: Response): Promise<void>;
}
