import { IBooking } from "../../models/booking.model";
import {
  CreateBookingDTO,
  BookingRescheduleRequestDTO,
  BookingRescheduleResponseDTO,
} from "../../dto/booking.dto";

export interface IBookingService {
  createBookingRequest(userId: string, data: CreateBookingDTO): Promise<IBooking>;
  getBookingDetails(id: string): Promise<IBooking | null>;
  getBookingByBookingId(bookingId: string): Promise<IBooking | null>;
  getUserBookings(
    userId: string | undefined,
    page?: number,
    limit?: number,
    search?: string,
    status?: string,
  ): Promise<{ bookings: IBooking[]; total: number }>;
  getPhotographerBookings(
    photographerId: string | undefined,
    page?: number,
    limit?: number,
    search?: string,
    status?: string,
  ): Promise<{ bookings: IBooking[]; total: number }>;
  acceptBooking(id: string, message?: string): Promise<IBooking | null>;
  confirmPayment(id: string, paymentIntentId: string): Promise<IBooking | null>;
  createBookingPaymentIntent(
    bookingId: string,
    frontendUrl?: string,
  ): Promise<{ url: string } | null>;
  rejectBooking(id: string, message?: string): Promise<IBooking | null>;
  cancelBooking(
    id: string,
    userId: string,
    reason?: string,
    isEmergency?: boolean,
  ): Promise<IBooking | null>;
  completeBooking(id: string): Promise<IBooking | null>;
  startWork(id: string): Promise<IBooking | null>;
  endWork(id: string): Promise<IBooking | null>;
  confirmEndWork(id: string): Promise<IBooking | null>;
  deliverWork(id: string, deliveryLink: string): Promise<IBooking | null>;
  confirmWorkDelivery(id: string): Promise<IBooking | null>;
  requestReschedule(
    bookingId: string,
    data: BookingRescheduleRequestDTO,
    userId: string,
  ): Promise<IBooking | null>;
  respondToReschedule(
    bookingId: string,
    data: BookingRescheduleResponseDTO,
    userId: string,
  ): Promise<IBooking | null>;
}
