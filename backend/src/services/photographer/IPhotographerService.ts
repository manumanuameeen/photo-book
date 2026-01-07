import { ApplyPhtographerDtoType, PhotographerResponseDto } from "../../dto/photographer.dto";
import { PhotographerDashboardStatsDto } from "../../dto/photographer.dashboard.dto";

export interface IPhotographerService {
    apply(userId: string, data: ApplyPhtographerDtoType): Promise<PhotographerResponseDto>;
    getDashboardStats(userId: string): Promise<PhotographerDashboardStatsDto>;
    getPhotographers(filters: { category?: string; priceRange?: string; location?: string; lat?: number; lng?: number }): Promise<any[]>;
    getPhotographerById(id: string): Promise<any>;
    addReview(userId: string, photographerId: string, review: { rating: number; comment: string }): Promise<any>;
    getBookings(userId: string, status?: string, page?: number, limit?: number): Promise<any>;
}
