import express from "express";
import type { AuthRequest } from "../../middleware/authMiddleware.ts";

export interface IUserController {
  getProfile(req: AuthRequest, res: express.Response): Promise<void>;
  UpdateProfile(req: AuthRequest, res: express.Response): Promise<void>;
  changePassword(req: AuthRequest, res: express.Response): Promise<void>;
  initiateChangePassword(req: AuthRequest, res: express.Response): Promise<void>;
  uploadProfileImage(req: AuthRequest, res: express.Response): Promise<void>;
}
