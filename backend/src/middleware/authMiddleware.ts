import Jwt from "jsonwebtoken";
import { PhotographerModel } from "../models/photographer.model";
import { HttpStatus } from "../constants/httpStatus";
import type { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

export interface JWTPayload {
  userId: string;
  role: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
  role?: string;
  userId?: string;
}

export const verifyAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
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

    (req as AuthRequest).user = decoded;
    (req as AuthRequest).role = decoded.role;
    (req as AuthRequest).userId = decoded.userId;

    next();
  } catch (error: unknown) {
    const err = error as Error;
    const message =
      err.name === "TokenExpiredError"
        ? "Session expired. Please refresh your token."
        : "Invalid authentication token.";

    console.error(`❌ [Auth Error]: ${message}`, err.message);

    return res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      message,
      code: "INVALID_TOKEN",
    });
  }
};

export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if ((req as AuthRequest).role !== "admin") {
    return res.status(HttpStatus.FORBIDDEN).json({
      success: false,
      message: "Access denied. Admin privileges required.",
      code: "ACCESS_DENIED",
    });
  }
  next();
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next();
    }

    const decoded = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JWTPayload;
    (req as AuthRequest).user = decoded;
    (req as AuthRequest).role = decoded.role;
    (req as AuthRequest).userId = decoded.userId;

    next();
  } catch {
    next();
  }
};
