import type { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  role?: string;
}

export const verifyAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  console.log(req.role)
  if (req.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." ,redirectTo:"/auth/login"});
  }
  next();
};
