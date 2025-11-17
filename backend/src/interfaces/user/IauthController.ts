import express from "express";

export interface IAuthController {
  signup(req: express.Request, res: express.Response): Promise<void>;
  verifyOtp(req: express.Request, res: express.Response): Promise<void>;
  resendOtp(req: express.Request, res: express.Response): Promise<void>;
  login(req: express.Request, res: express.Response): Promise<void>;
  refresh(req: express.Request, res: express.Response): Promise<void>;
  forgetpassword(req: express.Request, res: express.Response): Promise<void>;
  verifyResetOtp(req: express.Request, res: express.Response): Promise<void>;
  resetPassword(req: express.Request, res: express.Response): Promise<void>;
}
