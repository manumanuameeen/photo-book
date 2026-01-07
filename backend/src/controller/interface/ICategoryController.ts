import { Request, Response, NextFunction } from "express";

export interface ICategoryController {
    getCategories(req: Request, res: Response, next: NextFunction): Promise<void>;
    createCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    suggestCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    approveCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    rejectCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
}
