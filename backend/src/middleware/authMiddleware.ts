import Jwt from "jsonwebtoken";
import { PhotographerModel } from "../model/photographerModel.ts";
import { HttpStatus } from "../constants/httpStatus.ts";
import type { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

interface JWTPayload {
  userId: string;
  role: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
  role?: string;
  userId?: string;
}

export const verifyAccessToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      console.warn("⚠️ [Auth] No access token provided");
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized access. Please login again.",
        code: "NO_TOKEN",
      });
    }

    const decoded = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JWTPayload;

    if (decoded.role === "photographer") {
      const photographer = await PhotographerModel.findOne({ userId: decoded.userId }).select(
        "isBlock",
      );
      if (photographer?.isBlock) {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          message: "Your account has been suspended. Please contact support.",
          code: "ACCOUNT_BLOCKED",
        });
      }
    }

    req.user = decoded;
    req.role = decoded.role;
    req.userId = decoded.userId;

    next();
  } catch (error: any) {
    const message =
      error.name === "TokenExpiredError"
        ? "Session expired. Please refresh your token."
        : "Invalid authentication token.";

    console.error(`❌ [Auth Error]: ${message}`, error.message);

    return res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      message,
      code: "INVALID_TOKEN",
    });
  }
};

