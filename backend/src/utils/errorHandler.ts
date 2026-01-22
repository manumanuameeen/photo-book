import { Response } from "express";
import { AppError } from "./AppError.ts";
import { HttpStatus } from "../constants/httpStatus.ts";

export const handleError = (res: Response, error: any) => {
  console.error("Error detected:", error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof Error) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "An unexpected error occurred",
  });
};

