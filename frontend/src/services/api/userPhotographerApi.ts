import apiClient from "../apiClient";

export interface PhotographerFilter {
    category?: string;
    priceRange?: string;
    location?: string;
    lat?: number;
    lng?: number;
}

export const userPhotographerApi = {
    getPhotographers: async (filters: PhotographerFilter) => {
        const response = await apiClient.get("/photographer/public/photographers", {
            params: filters
        });
        return response.data.data;
    },
    getPhotographerById: async (id: string) => {
        const response = await apiClient.get(`/photographer/public/photographers/${id}`);
        return response.data.data;
    },

    addReview: async (id: string, reviewData: { rating: number; comment: string }) => {
        const response = await apiClient.post(`/photographer/public/photographers/${id}/review`, reviewData);
        return response.data.data;
    },
    getAvailability: async (id: string, startDate: string, endDate: string) => {
        const response = await apiClient.get(`/photographer/public/photographers/${id}/availability`, {
            params: { startDate, endDate }
        });
        return response.data.data;
    }
};

