import { Request, Response } from "express";

export interface IPaymentController {
  createPaymentIntent(req: Request, res: Response): Promise<void>;
  confirmPayment(req: Request, res: Response): Promise<void>;
}
