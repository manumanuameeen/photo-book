import type { Response, NextFunction } from "express";
import { Messages } from "../constants/messages";
import { HttpStatus } from "../constants/httpStatus";
import redisClient from "../config/redis";

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

    // Use Redis cache instead of DB query — consistent with auth middleware
    const isBlocked = await redisClient.get(`blocked:${req.userId}`);

    if (isBlocked === "true") {
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
