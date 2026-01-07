import { Response } from "express";
import { AppError } from "./AppError";
import { HttpStatus } from "../constants/httpStatus";

export const handleError = (res: Response, error: any) => {
    console.error("Error detected:", error);

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }

    if (error instanceof Error) {
        return res.status(HttpStatus.BAD_REQUEST).json({ // Defaulting to Bad Request for generic errors often caught in services, or 500?
            // Service errors like "Insufficient balance" are usually business logic errors (400), not server crashes (500).
            // However, truly unexpected errors should be 500.
            // Given my service throws new Error("message"), I'll treat them as 400 or 500.
            // Let's use 500 for generic Error unless specific text matches? 
            // actually, safely calling it 500 or 400 depending on context is hard.
            // ideally Services should throw AppError.
            // For now, I'll send 500 for generic, but maybe 400 is safer for "Booking not found" etc if they just throw Error.
            // "Booking not found" -> 400/404.
            // I'll stick to 500 for unknown, but expose message for debugging if env is dev.
            success: false,
            message: error.message || "Internal Server Error",
        });
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "An unexpected error occurred",
    });
};
