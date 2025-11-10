import type { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  role?: string;
}

export const verifyAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};
