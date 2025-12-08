import Jwt from "jsonwebtoken";
import { PhotographerModel } from "../model/photographerModel";
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
      console.log(" No access token in cookies");
      return res.status(401).json({
        message: "Unauthorized - No token provided",
        redirectTo: "/auth/login",
      });
    }

    const decoded = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JWTPayload;

    // Check if photographer is blocked
    if (decoded.role === "photographer") {
      const photographer = await PhotographerModel.findOne({ userId: decoded.userId });
      if (photographer && photographer.isBlock) {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return res.status(403).json({
          message: "Account is blocked. Please contact support.",
          redirectTo: "/auth/login",
        });
      }
    }

    req.user = decoded;
    req.role = decoded.role;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error(" Token verification error:", error);
    return res.status(403).json({
      message: "Invalid or expired token",
      redirectTo: "/auth/login",
    });
  }
};
