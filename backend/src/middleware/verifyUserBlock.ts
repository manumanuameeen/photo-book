import type { Response, NextFunction } from "express";
import { User } from "../models/user.model";
import { Messages } from "../constants/messages";
import { HttpStatus } from "../constants/httpStatus";

import { AuthRequest } from "./authMiddleware";

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
      res.clearCookie("accessToken", { secure: true, sameSite: "none" });
      res.clearCookie("refreshToken", { secure: true, sameSite: "none" });

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
