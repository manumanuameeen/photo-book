import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";

export interface IAdminPhotographerController {
  getPhotographers(req: AuthRequest, res: Response): Promise<void>;
  getPhotographerById(req: AuthRequest, res: Response): Promise<void>;
  blockPhotographer(req: AuthRequest, res: Response): Promise<void>;
  unblockPhotographer(req: AuthRequest, res: Response): Promise<void>;
  getApplications(req: AuthRequest, res: Response): Promise<void>;
  getApplicationById(req: AuthRequest, res: Response): Promise<void>;
  approveApplication(req: AuthRequest, res: Response): Promise<void>;
  rejectApplication(req: AuthRequest, res: Response): Promise<void>;
  getStatistics(req: AuthRequest, res: Response): Promise<void>;

  getPackages(req: AuthRequest, res: Response): Promise<void>;
  approvePackage(req: AuthRequest, res: Response): Promise<void>;
  rejectPackage(req: AuthRequest, res: Response): Promise<void>;
  blockPackage(req: AuthRequest, res: Response): Promise<void>;
  unblockPackage(req: AuthRequest, res: Response): Promise<void>;
  fixLegacyData(req: AuthRequest, res: Response): Promise<void>;
}
