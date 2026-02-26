import { IBooking } from "../../model/bookingModel.ts";
import { IBaseRepository } from "./IBaseRepository.ts";

export interface IBookingRepository extends IBaseRepository<IBooking> {
  findById(id: string): Promise<IBooking | null>;
  findByBookingId(bookingId: string): Promise<IBooking | null>;
  updateStatus(id: string, status: string): Promise<IBooking | null>;
  findByUser(
    userId: string,
    page?: number,
    limit?: number,
    search?: string,
    status?: string,
  ): Promise<{ bookings: IBooking[]; total: number }>;
  findByPhotographer(
    photographerId: string,
    page?: number,
    limit?: number,
    search?: string,
    status?: string,
  ): Promise<{ bookings: IBooking[]; total: number }>;
  findEscrowHoldings(
    page?: number,
    limit?: number,
    search?: string,
  ): Promise<{ bookings: IBooking[]; total: number }>;
  getAdminStats(): Promise<{ revenue: number; volume: number; escrow: number; payouts: number }>;
}
