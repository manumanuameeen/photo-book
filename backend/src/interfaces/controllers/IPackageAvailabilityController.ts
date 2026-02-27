import { Request, Response } from "express";

export interface IPackageAvailabilityController {
  createPackage(req: Request, res: Response): Promise<void>;
  getPackages(req: Request, res: Response): Promise<void>;
  updatePackage(req: Request, res: Response): Promise<void>;
  deletePackage(req: Request, res: Response): Promise<void>;
  setAvailability(req: Request, res: Response): Promise<void>;
  getAvailability(req: Request, res: Response): Promise<void>;

  getPublicPackages(req: Request, res: Response): Promise<void>;
  getPublicAvailability(req: Request, res: Response): Promise<void>;
  blockRange(req: Request, res: Response): Promise<void>;
  toggleLike(req: Request, res: Response): Promise<void>;
}
