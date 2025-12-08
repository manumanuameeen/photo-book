import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";

export interface IAdminPhotographerController {
    getPhotographers(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getPhotographerById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    blockPhotographer(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    unblockPhotographer(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getApplications(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getApplicationById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    approveApplication(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    rejectApplication(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getStatistics(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
