import { Request, Response } from "express";

export interface IPortfolioController {
  createSection(req: Request, res: Response): Promise<void>;
  getSections(req: Request, res: Response): Promise<void>;
  updateSection(req: Request, res: Response): Promise<void>;
  deleteSection(req: Request, res: Response): Promise<void>;
  addImageToSection(req: Request, res: Response): Promise<void>;
  removeImageFromSection(req: Request, res: Response): Promise<void>;
  toggleLike(req: Request, res: Response): Promise<void>;
}
