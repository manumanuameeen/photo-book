import { Request, Response, NextFunction } from "express";

export interface IPaymentController {
  createPaymentIntent(req: Request, res: Response, next: NextFunction): Promise<void>;
  confirmPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
}
