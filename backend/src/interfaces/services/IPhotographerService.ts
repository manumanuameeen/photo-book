import {
  ApplyPhtographerDtoType,
  PhotographerResponseDto,
  IPaginatedPhotographerResponse,
} from "../../dto/photographer.dto";
import { PhotographerDashboardStatsDto } from "../../dto/photographerDashboard.dto";
import { IBooking } from "../../models/booking.model";
import { IPhotographer } from "../../models/photographer.model";

export interface IPhotographerService {
  apply(userId: string, data: ApplyPhtographerDtoType): Promise<PhotographerResponseDto>;
  getDashboardStats(userId: string): Promise<PhotographerDashboardStatsDto>;
  getPhotographers(filters: {
    category?: string;
    priceRange?: string;
    location?: string;
    lat?: number;
    lng?: number;
    page: number;
    limit: number;
  }): Promise<IPaginatedPhotographerResponse>;
  getPhotographerById(id: string): Promise<unknown | null>;
  addReview(
    userId: string,
    photographerId: string,
    review: { rating: number; comment: string },
  ): Promise<unknown>;
  getBookings(
    userId: string,
    status?: string,
    page?: number,
    limit?: number,
  ): Promise<{ bookings: unknown[]; total?: number; pagination?: unknown }>;
  updateProfile(userId: string, data: Partial<IPhotographer>): Promise<PhotographerResponseDto>;
  getOwnProfile(userId: string): Promise<PhotographerResponseDto>;
  toggleLike(id: string, userId: string): Promise<IPhotographer | boolean>;
}
