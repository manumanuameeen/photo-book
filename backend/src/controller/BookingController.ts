import { Request, Response } from "express";
import { IBookingController } from "../interfaces/controllers/IBookingController.ts";
import { IBookingService } from "../interfaces/services/IBookingService.ts";
import { HttpStatus } from "../constants/httpStatus.ts";
import { AuthRequest } from "../middleware/authMiddleware.ts";
import { ApiResponse } from "../utils/response.ts";
import { AppError } from "../utils/AppError.ts";
import { Messages } from "../constants/messages.ts";
import { CreateBookingDTO, BookingRescheduleRequestDTO, BookingRescheduleResponseDTO } from "../dto/booking.dto.ts";

export class BookingController implements IBookingController {
  private _bookingService: IBookingService;
  constructor(bookingService: IBookingService) {
    this._bookingService = bookingService;
  }

  createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const bookingData = req.body as CreateBookingDTO;

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
        throw new AppError(Messages.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      ApiResponse.success(res, booking, Messages.BOOKING_FETCHED);
    } catch (error) {
      this._handleError(res, error);
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
    } catch (error) {
      this._handleError(res, error);
    }
  };

  getPhotographerBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const photographerId = req.user?.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
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

  createBookingPaymentIntent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const session = await this._bookingService.createBookingPaymentIntent(id);
      ApiResponse.success(res, session, Messages.PAYMENT_INTENT_CREATED);
    } catch (error) {
      this._handleError(res, error);
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
    } catch (error) {
      console.error("[BookingController] confirmPayment Error:", error);
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
      const { reason, isEmergency } = req.body;
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;

      if (!userId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      const booking = await this._bookingService.cancelBooking(id, userId, reason, isEmergency);
      ApiResponse.success(res, booking, Messages.BOOKING_CANCELLED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  completeBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const booking = await this._bookingService.completeBooking(id);
      ApiResponse.success(res, booking, Messages.BOOKING_COMPLETED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  startWork = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const booking = await this._bookingService.startWork(id);
      ApiResponse.success(res, booking, Messages.WORK_STARTED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  endWork = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const booking = await this._bookingService.endWork(id);
      ApiResponse.success(res, booking, Messages.WORK_END_REQUESTED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  confirmEndWork = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const booking = await this._bookingService.confirmEndWork(id);
      ApiResponse.success(res, booking, Messages.WORK_COMPLETION_CONFIRMED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  deliverWork = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { deliveryLink } = req.body;
      console.log(`[BookingController] deliverWork called for ID: ${id} with link: ${deliveryLink}`);

      const booking = await this._bookingService.deliverWork(id, deliveryLink);
      console.log(`[BookingController] deliverWork success for ID: ${id}`);
      ApiResponse.success(res, booking, Messages.WORK_DELIVERED);
    } catch (error) {
      console.error(`[BookingController] deliverWork Error for ID: ${req.params.id}:`, error);
      this._handleError(res, error);
    }
  };

  confirmWorkDelivery = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      console.log(`[BookingController] confirmWorkDelivery called for ID: ${id}`);
      const booking = await this._bookingService.confirmWorkDelivery(id);
      ApiResponse.success(res, booking, Messages.WORK_DELIVERY_CONFIRMED);
    } catch (error) {
      console.error(`[BookingController] confirmWorkDelivery Error for ID: ${req.params.id}:`, error);
      this._handleError(res, error);
    }
  };



  requestReschedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { newDate, newStartTime, reason } = req.body;
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;

      if (!userId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      const booking = await this._bookingService.requestReschedule(
        id,
        { newDate, newStartTime, reason } as BookingRescheduleRequestDTO,
        userId,
      );
      ApiResponse.success(res, booking, Messages.RESCHEDULE_REQUEST_SUBMITTED);
    } catch (error) {
      this._handleError(res, error);
    }
  };

  respondToReschedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { decision } = req.body;
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;

      if (!userId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      const booking = await this._bookingService.respondToReschedule(id, { decision } as BookingRescheduleResponseDTO, userId);
      ApiResponse.success(res, booking, `${Messages.RESCHEDULE_PROCESSED}: ${decision}`);
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
