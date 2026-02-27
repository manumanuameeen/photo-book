import { Response } from "express";
import { z } from "zod";
import { AppError } from "./AppError.ts";
import { ApiResponse } from "./response.ts";
import { HttpStatus } from "../constants/httpStatus.ts";
import { Messages } from "../constants/messages.ts";

export const handleError = (res: Response, error: unknown) => {
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
