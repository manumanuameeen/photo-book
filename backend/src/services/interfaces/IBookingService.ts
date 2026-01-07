import { IBooking } from "../../model/bookingModel";

export interface IBookingService {
    createBookingRequest(userId: string, data: any): Promise<IBooking>;
    getBookingDetails(id: string): Promise<IBooking | null>;
    getUserBookings(userId: string | undefined, page?: number, limit?: number): Promise<{ bookings: IBooking[], total: number }>;
    getPhotographerBookings(photographerId: string | undefined): Promise<IBooking[]>;
    acceptBooking(id: string, message?: string): Promise<IBooking | null>;
    confirmPayment(id: string): Promise<IBooking | null>;
    rejectBooking(id: string, message?: string): Promise<IBooking | null>;
    cancelBooking(id: string, userId: string): Promise<IBooking | null>;
}
