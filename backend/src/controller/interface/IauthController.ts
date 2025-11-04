import { Request, Response } from "express";

export interface IAuthController {
  signup(req: Request, res: Response): Promise<void>;
  verifyOtp(req: Request, res: Response): Promise<void>;
  login(req: Request, res: Response): Promise<void>;
  refresh(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
}
