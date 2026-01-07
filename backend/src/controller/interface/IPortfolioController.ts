import { Request, Response, NextFunction } from "express";

export interface IPortfolioController {
    createSection(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSections(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateSection(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteSection(req: Request, res: Response, next: NextFunction): Promise<void>;
    addImageToSection(req: Request, res: Response, next: NextFunction): Promise<void>;
    removeImageFromSection(req: Request, res: Response, next: NextFunction): Promise<void>;
}
