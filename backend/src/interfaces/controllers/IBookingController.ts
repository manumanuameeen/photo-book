import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";

export interface IBookingController {
  createBooking(req: AuthRequest, res: Response): Promise<void>;
  getBookingDetails(req: Request, res: Response): Promise<void>;
  getBookingByBookingId(req: Request, res: Response): Promise<void>;
  getUserBookings(req: AuthRequest, res: Response): Promise<void>;
  getPhotographerBookings(req: AuthRequest, res: Response): Promise<void>;
  acceptBooking(req: Request, res: Response): Promise<void>;
  confirmPayment(req: Request, res: Response): Promise<void>;
  createBookingPaymentIntent(req: AuthRequest, res: Response): Promise<void>;
  rejectBooking(req: Request, res: Response): Promise<void>;
  cancelBooking(req: AuthRequest, res: Response): Promise<void>;
  completeBooking(req: Request, res: Response): Promise<void>;
  startWork(req: Request, res: Response): Promise<void>;
  endWork(req: Request, res: Response): Promise<void>;
  confirmEndWork(req: Request, res: Response): Promise<void>;
  deliverWork(req: Request, res: Response): Promise<void>;
  confirmWorkDelivery(req: Request, res: Response): Promise<void>;
  requestReschedule(req: AuthRequest, res: Response): Promise<void>;
  respondToReschedule(req: AuthRequest, res: Response): Promise<void>;
}
