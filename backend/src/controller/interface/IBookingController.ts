
import { Request, Response } from "express";

export interface IBookingController {
    createBooking(req: Request, res: Response): Promise<void>;
    getBookingDetails(req: Request, res: Response): Promise<void>;
    getUserBookings(req: Request, res: Response): Promise<void>;
    getPhotographerBookings(req: Request, res: Response): Promise<void>;
    acceptBooking(req: Request, res: Response): Promise<void>;
    confirmPayment(req: Request, res: Response): Promise<void>;
    rejectBooking(req: Request, res: Response): Promise<void>;
    cancelBooking(req: Request, res: Response): Promise<void>;
}
