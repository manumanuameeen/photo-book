import { Request, Response } from "express";
import { IBookingController } from "./interface/IBookingController";
import { IBookingService } from "../services/interfaces/IBookingService";
import { HttpStatus } from "../constants/httpStatus";
import { AuthRequest } from "../middleware/authMiddleware";
import { ApiResponse } from "../utils/response";
import { AppError } from "../utils/AppError";
import { Messages } from "../constants/messages";

export class BookingController implements IBookingController {
    constructor(private _bookingService: IBookingService) { }

    createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const bookingData = req.body;

            if (!userId) {
                throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
            }

            const booking = await this._bookingService.createBookingRequest(userId, bookingData);
            ApiResponse.success(res, booking, Messages.BOOKING_CREATED, HttpStatus.CREATED);
        } catch (error) {
            this._handleError(res, error);
        }
    };

    getBookingDetails = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const booking = await this._bookingService.getBookingDetails(id);
            if (!booking) {
                throw new AppError("Booking not found", HttpStatus.NOT_FOUND);
            }
            ApiResponse.success(res, booking, Messages.BOOKING_FETCHED);
        } catch (error) {
            this._handleError(res, error);
        }
    };

    getUserBookings = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 5;

            if (!userId) {
                throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
            }

            const result = await this._bookingService.getUserBookings(userId, page, limit);
            ApiResponse.success(res, result, Messages.BOOKINGS_FETCHED);
        } catch (error) {
            this._handleError(res, error);
        }
    };

    getPhotographerBookings = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const photographerId = req.user?.userId;

            if (!photographerId) {
                throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
            }

            const bookings = await this._bookingService.getPhotographerBookings(photographerId);
            ApiResponse.success(res, bookings, Messages.BOOKINGS_FETCHED);
        } catch (error) {
            this._handleError(res, error);
        }
    };

    acceptBooking = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { message } = req.body;
            const booking = await this._bookingService.acceptBooking(id, message);
            ApiResponse.success(res, booking, Messages.BOOKING_ACCEPTED);
        } catch (error) {
            this._handleError(res, error);
        }
    };

    confirmPayment = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const booking = await this._bookingService.confirmPayment(id);
            ApiResponse.success(res, booking, Messages.PAYMENT_CONFIRMED);
        } catch (error) {
            this._handleError(res, error);
        }
    };

    rejectBooking = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { message } = req.body;
            const booking = await this._bookingService.rejectBooking(id, message);
            ApiResponse.success(res, booking, Messages.BOOKING_REJECTED);
        } catch (error) {
            this._handleError(res, error);
        }
    };

    cancelBooking = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const authReq = req as AuthRequest;
            const userId = authReq.user?.userId;

            if (!userId) {
                throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
            }

            const booking = await this._bookingService.cancelBooking(id, userId);
            ApiResponse.success(res, booking, Messages.BOOKING_CANCELLED);
        } catch (error) {
            this._handleError(res, error);
        }
    };

    private _handleError(res: Response, error: unknown): void {
        if (error instanceof AppError) {
            ApiResponse.error(res, error.message, error.statusCode as HttpStatus);
            return;
        }
        if (error instanceof Error) {
            ApiResponse.error(res, error.message, HttpStatus.BAD_REQUEST);
            return;
        }
        ApiResponse.error(res, Messages.INTERNAL_ERROR);
    }
}
