import type { Response } from "express";
import { HttpStatus } from "../constants/httpStatus.ts";

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message: string = "Success",
    status: HttpStatus = HttpStatus.OK,
  ) {
    return res.status(status).json({
      success: true,
      message,
      data,
    });
  }

  static error(
    res: Response,
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    return res.status(status).json({
      success: false,
      message,
    });
  }
}
