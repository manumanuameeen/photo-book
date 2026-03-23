import type { Request, Response, NextFunction } from "express";
import { tokenBlacklistService } from "../services/token/tokenBlacklist.service";
import { HttpStatus } from "../constants/httpStatus";
import { Messages } from "../constants/messages";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    email: string;
  };
}

export const checkTokenBlacklist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: Messages.NO_TOKEN_PROVIDED,
      });
      return;
    }

    const isBlacklisted = await tokenBlacklistService.isBlackListed(token);

    if (isBlacklisted) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: Messages.TOKEN_INVALID,
      });
      return;
    }

    next();
  } catch {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: Messages.INTERNAL_ERROR,
    });
  }
};
