import { Request, Response } from "express";

export interface IReportCategoryController {
  createCategory(req: Request, res: Response): Promise<void>;
  getCategoryById(req: Request, res: Response): Promise<void>;
  getAllCategories(req: Request, res: Response): Promise<void>;
  updateCategory(req: Request, res: Response): Promise<void>;
  deleteCategory(req: Request, res: Response): Promise<void>;
}
