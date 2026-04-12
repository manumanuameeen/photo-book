import { IBooking } from "../../../models/booking.model";

export interface IBookingPaymentService {
  createPaymentIntent(bookingId: string, frontendUrl?: string): Promise<{ url: string; sessionId: string }>;
  confirmPayment(bookingId: string, paymentIntentId: string): Promise<IBooking | null>;
  processCancellation(booking: IBooking, cancelledByUserId: string): Promise<void>;
  releaseFunds(bookingId: string, userId?: string): Promise<void>;
}
