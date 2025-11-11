import Jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

interface JWTPayload {
  userId: string;
  role: string;
  email: string;
}

interface AuthRequest extends Request {
  user?: JWTPayload;
  role?: string;
  userId?: string;
}

export const verifyAccessToken = (req: AuthRequest, res: Response, next: NextFunction) => {
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
