import express from "express";
import type { AuthRequest } from "../../middleware/authMiddleware.ts";

export interface IUserController {
  getProfile(req: AuthRequest, res: express.Response, next: express.NextFunction): Promise<void>;
  UpdateProfile(req: AuthRequest, res: express.Response, next: express.NextFunction): Promise<void>;
  changePassword(
    req: AuthRequest,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<void>;
  initiateChangePassword(
    req: AuthRequest,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<void>;
  uploadProfileImage(
    req: AuthRequest,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<void>;
}

