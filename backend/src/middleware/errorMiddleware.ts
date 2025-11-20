import type { Request, Response, NextFunction } from "express";
import logger from "../config/logger.ts";
import { AppError } from "../utils/AppError.ts";

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    logger.warn(`AppError : ${err.message}`, {
      statusCode: err.statusCode,
      path: req.originalUrl,
      method: req.method,
    });

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof Error) {
    logger.error(`Unexpected Error: ${err.message}`, {
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
    });

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }

  logger.error(`Non-standard error thrown: ${String(err)}`);

  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
};
