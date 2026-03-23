import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { JWTPayload } from "../middleware/authMiddleware";
export const createAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(
    { ...payload },
    process.env.ACCESS_TOKEN_SECRET as jwt.Secret,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d",
    } as jwt.SignOptions,
  );
};

export const createRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(
    { ...payload },
    process.env.REFRESH_TOKEN_SECRET as jwt.Secret,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    } as jwt.SignOptions,
  );
};
