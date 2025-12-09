import type { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  role?: string;
  user?: any;
}

export const verifyAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.role) {
    console.log("reaching here ")
    console.log(" No role found");
    return res.status(401).json({
      message: "Authentication required",
      redirectTo: "/auth/login",
    });
  }

  if (req.role !== "admin") {
    console.log(" user is not admin, role:", req.role);
    return res.status(403).json({
      message: "Access denied. Admins only.",
      redirectTo: "/auth/login",
    });
  }

  console.log(" admin verified successfully");
  next();
};
