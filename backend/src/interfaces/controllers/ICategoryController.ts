import { Request, Response } from "express";

export interface ICategoryController {
  getCategories(req: Request, res: Response): Promise<void>;
  createCategory(req: Request, res: Response): Promise<void>;
  updateCategory(req: Request, res: Response): Promise<void>;
  deleteCategory(req: Request, res: Response): Promise<void>;
  suggestCategory(req: Request, res: Response): Promise<void>;
  approveCategory(req: Request, res: Response): Promise<void>;
  rejectCategory(req: Request, res: Response): Promise<void>;
}
