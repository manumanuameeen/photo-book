import { IBooking } from "../../model/bookingModel";
import { IBaseRepository } from "./IBaseRepository";

export interface IBookingRepository extends IBaseRepository<IBooking> {
    findById(id: string): Promise<IBooking | null>;
    updateStatus(id: string, status: string): Promise<IBooking | null>;
    findByUser(userId: string, page?: number, limit?: number): Promise<{ bookings: IBooking[], total: number }>;
    findByPhotographer(photographerId: string): Promise<IBooking[]>;
}
