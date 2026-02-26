import { Request, Response, NextFunction } from "express";

export interface IPackageAvailabilityController {
  createPackage(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPackages(req: Request, res: Response, next: NextFunction): Promise<void>;
  updatePackage(req: Request, res: Response, next: NextFunction): Promise<void>;
  deletePackage(req: Request, res: Response, next: NextFunction): Promise<void>;
  setAvailability(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAvailability(req: Request, res: Response, next: NextFunction): Promise<void>;

  getPublicPackages(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPublicAvailability(req: Request, res: Response, next: NextFunction): Promise<void>;
  blockRange(req: Request, res: Response, next: NextFunction): Promise<void>;
  toggleLike(req: Request, res: Response, next: NextFunction): Promise<void>;
}
