import { Request, Response, NextFunction } from "express";

export interface IAdminRentalController {
  getAdminItems(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllOrders(req: Request, res: Response, next: NextFunction): Promise<void>;
}
