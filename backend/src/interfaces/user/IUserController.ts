import express from "express";
import type { AuthRequest } from "../../middleware/authMiddleware";

export interface IUserController {
  getProfile(req: AuthRequest, res: express.Response, next: express.NextFunction): Promise<void>;
  UpdateProfile(req: AuthRequest, res: express.Response, next: express.NextFunction): Promise<void>;
  changePassword(
    req: AuthRequest,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<void>;
}
