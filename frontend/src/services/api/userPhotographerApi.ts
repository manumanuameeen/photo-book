import apiClient from "../apiClient";
import { API_ROUTES } from "../../constants/apiRoutes";

export interface PhotographerFilter {
    category?: string;
    priceRange?: string;
    location?: string;
    lat?: number;
    lng?: number;
    page?: number;
    limit?: number;
}

export const userPhotographerApi = {
    getPhotographers: async (filters: PhotographerFilter) => {
        const response = await apiClient.get(API_ROUTES.PHOTOGRAPHER.PUBLIC.LIST, {
            params: filters
        });
        return response.data.data;
    },
    getPhotographerById: async (id: string) => {
        const response = await apiClient.get(API_ROUTES.PHOTOGRAPHER.PUBLIC.DETAILS(id));
        return response.data.data;
    },

    addReview: async (id: string, reviewData: { rating: number; comment: string }) => {
        const response = await apiClient.post(API_ROUTES.PHOTOGRAPHER.PUBLIC.REVIEW(id), reviewData);
        return response.data.data;
    },
    getAvailability: async (id: string, startDate: string, endDate: string) => {
        const response = await apiClient.get(API_ROUTES.PHOTOGRAPHER.PUBLIC.AVAILABILITY(id), {
            params: { startDate, endDate }
        });
        return response.data.data;
    }
};

