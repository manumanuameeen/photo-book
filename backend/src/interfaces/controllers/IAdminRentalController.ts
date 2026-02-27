import { Request, Response } from "express";

export interface IAdminRentalController {
  getAdminItems(req: Request, res: Response): Promise<void>;
  getAllOrders(req: Request, res: Response): Promise<void>;
}
