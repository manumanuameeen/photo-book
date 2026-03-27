import { Request, Response } from "express";
import { z } from "zod";
import { IBookingController } from "../../interfaces/controllers/IBookingController";
import { IBookingService } from "../../interfaces/services/IBookingService";
import { HttpStatus } from "../../constants/httpStatus";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ApiResponse } from "../../utils/response";
import { AppError } from "../../utils/AppError";
import { Messages } from "../../constants/messages";
import { handleError } from "../../utils/errorHandler";
import {
  CreateBookingSchema,
  BookingRescheduleRequestSchema,
  BookingRescheduleResponseSchema,
} from "../../dto/booking.dto";

export class BookingController implements IBookingController {
  private _bookingService: IBookingService;

  constructor(bookingService: IBookingService) {
    this._bookingService = bookingService;
  }

  private _validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
  }

  createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      const bookingData = this._validate(CreateBookingSchema, req.body);
      const booking = await this._bookingService.createBookingRequest(userId, bookingData);
      ApiResponse.success(res, booking, Messages.BOOKING_CREATED, HttpStatus.CREATED);
    } catch (error: unknown) {
      handleError(res, error);
    }
  };

  getBookingDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const booking = await this._bookingService.getBookingDetails(id);
      if (!booking) {
        throw new AppError(Messages.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      ApiResponse.success(res, booking, Messages.BOOKING_FETCHED);
    } catch (error: unknown) {
      handleError(res, error);
    }
  };

  getBookingByBookingId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bookingId } = req.params;
      const booking = await this._bookingService.getBookingByBookingId(bookingId);
      if (!booking) {
        throw new AppError(Messages.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      ApiResponse.success(res, booking, Messages.BOOKING_FETCHED);
    } catch (error: unknown) {
      handleError(res, error);
    }
  };

  getUserBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 5;
      const search = req.query.search as string;
      const status = req.query.status as string;

      if (!userId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      const result = await this._bookingService.getUserBookings(
        userId,
        page,
        limit,
        search,
        status,
      );
      ApiResponse.success(res, result, Messages.BOOKINGS_FETCHED);
    } catch (error: unknown) {
      handleError(res, error);
    }
  };

  getPhotographerBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const photographerId = req.user?.userId;
      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const status = (req.query.status as string) || "";

      if (!photographerId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      const result = await this._bookingService.getPhotographerBookings(
        photographerId,
        page,
        limit,
        search,
        status,
      );
      ApiResponse.success(res, result, Messages.BOOKINGS_FETCHED);
    } catch (error: unknown) {
      handleError(res, error);
    }
  };

  acceptBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const booking = await this._bookingService.acceptBooking(id, message);
      ApiResponse.success(res, booking, Messages.BOOKING_ACCEPTED);
    } catch (error: unknown) {
      handleError(res, error);
    }
  };

  createBookingPaymentIntent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const session = await this._bookingService.createBookingPaymentIntent(id);
      ApiResponse.success(res, session, Messages.PAYMENT_INTENT_CREATED);
    } catch (error: unknown) {
      handleError(res, error);
    }
  };

  confirmPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { paymentIntentId } = req.body;

      console.log(
        `[BookingController] confirmPayment called for ${id} with paymentIntentId: ${paymentIntentId}`,
      );

      if (!paymentIntentId) {
        throw new AppError(Messages.PAYMENT_INTENT_ID_REQUIRED, HttpStatus.BAD_REQUEST);
      }

      const booking = await this._bookingService.confirmPayment(id, paymentIntentId);
      ApiResponse.success(res, booking, Messages.PAYMENT_CONFIRMED);
    } catch (error: unknown) {
      console.error("[BookingController] confirmPayment Error:", error);
      handleError(res, error);
    }
  };

  rejectBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const booking = await this._bookingService.rejectBooking(id, message);
      ApiResponse.success(res, booking, Messages.BOOKING_REJECTED);
    } catch (error: unknown) {
      handleError(res, error);
    }
  };

  cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason, isEmergency } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      const booking = await this._bookingService.cancelBooking(id, userId, reason, isEmergency);
      ApiResponse.success(res, booking, Messages.BOOKING_CANCELLED);
    } catch (error: unknown) {
      handleError(res, error);
    }
  };

  completeBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const booking = await this._bookingService.completeBooking(id);
      ApiResponse.success(res, booking, Messages.BOOKING_COMPLETED);
    } catch (error: unknown) {
      handleError(res, error);
    }
  };

  startWork = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const booking = await this._bookingService.startWork(id);
      ApiResponse.success(res, booking, Messages.WORK_STARTED);
    } catch (error: unknown) {
      handleError(res, error);
    }
  };

  endWork = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const booking = await this._bookingService.endWork(id);
      ApiResponse.success(res, booking, Messages.WORK_END_REQUESTED);
    } catch (error: unknown) {
      handleError(res, error);
    }
  };

  confirmEndWork = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const booking = await this._bookingService.confirmEndWork(id);
      ApiResponse.success(res, booking, Messages.WORK_COMPLETION_CONFIRMED);
    } catch (error: unknown) {
      handleError(res, error);
    }
  };

  deliverWork = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { deliveryLink } = req.body;
      console.log(
        `[BookingController] deliverWork called for ID: ${id} with link: ${deliveryLink}`,
      );

      const booking = await this._bookingService.deliverWork(id, deliveryLink);
      ApiResponse.success(res, booking, Messages.WORK_DELIVERED);
    } catch (error: unknown) {
      console.error(`[BookingController] deliverWork Error for ID: ${req.params.id}:`, error);
      handleError(res, error);
    }
  };

  confirmWorkDelivery = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      console.log(`[BookingController] confirmWorkDelivery called for ID: ${id}`);
      const booking = await this._bookingService.confirmWorkDelivery(id);
      ApiResponse.success(res, booking, Messages.WORK_DELIVERY_CONFIRMED);
    } catch (error: unknown) {
      console.error(
        `[BookingController] confirmWorkDelivery Error for ID: ${req.params.id}:`,
        error,
      );
      handleError(res, error);
    }
  };

  requestReschedule = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      const booking = await this._bookingService.requestReschedule(
        id,
        this._validate(BookingRescheduleRequestSchema, req.body),
        userId,
      );
      ApiResponse.success(res, booking, Messages.RESCHEDULE_REQUEST_SUBMITTED);
    } catch (error: unknown) {
      handleError(res, error);
    }
  };

  respondToReschedule = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      const resultData = this._validate(BookingRescheduleResponseSchema, req.body);
      const booking = await this._bookingService.respondToReschedule(id, resultData, userId);
      ApiResponse.success(res, booking, `${Messages.RESCHEDULE_PROCESSED}: ${resultData.decision}`);
    } catch (error: unknown) {
      handleError(res, error);
    }
  };
}
