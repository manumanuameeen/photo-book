import { Response } from "express";
import { z } from "zod";
import { AppError } from "./AppError";
import { ApiResponse } from "./response";
import { HttpStatus } from "../constants/httpStatus";
import { Messages } from "../constants/messages";

export const handleError = (res: Response, error: unknown) => {
  console.error("Backend Error Logged:", error);
  if (error instanceof z.ZodError) {
    const errorMessage = error.issues.map((issue) => issue.message).join(", ");
    return ApiResponse.error(res, errorMessage, HttpStatus.BAD_REQUEST);
  }

  if (error instanceof AppError) {
    return ApiResponse.error(res, error.message, error.statusCode as HttpStatus);
  }

  if (error instanceof Error) {
    let status: HttpStatus = HttpStatus.BAD_REQUEST;
    if (error.message.toLowerCase().includes("blocked")) {
      status = HttpStatus.FORBIDDEN;
    } else if (error.message.toLowerCase().includes("exists")) {
      status = HttpStatus.CONFLICT;
    }
    return ApiResponse.error(res, error.message, status);
  }

  return ApiResponse.error(res, Messages.INTERNAL_ERROR);
};
