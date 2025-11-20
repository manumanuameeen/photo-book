import type { Request, Response, NextFunction } from "express";
import { User } from "../model/userModel.ts";
import { Messages } from "../constants/messages.ts";
import { HttpStatus } from "../constants/httpStatus.ts";

interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const verifyUserNotBlocked = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Authentication required",
        redirectTo: "/auth/login",
      });
      return;
    }

    const user = await User.findById(req.userId).select("isBlocked").lean();

    if (!user) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: Messages.USER_NOTFOUND,
        redirectTo: "/auth/login",
      });
      return;
    }

    if (user.isBlocked) {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: Messages.USER_BLOCKED,
        redirectTo: "/auth/login",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Error checking user blocked status:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: Messages.INTERNAL_ERROR,
    });
  }
};
