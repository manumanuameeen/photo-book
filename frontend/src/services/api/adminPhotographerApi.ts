import apiClient from "../apiClient";
import type {
    GetPhotographersParams,
    PaginatedPhotographersResponse,
    Photographer,
    PhotographerStats
} from "../../modules/admin/types/photographer.types";

export const adminPhotographerApi = {
    // Photographer Management
    getPhotographers: async (params: GetPhotographersParams): Promise<PaginatedPhotographersResponse> => {
        const response = await apiClient.get("/admin/photographers", { params });
        return response.data.data;
    },

    getPhotographerById: async (id: string): Promise<Photographer> => {
        const response = await apiClient.get(`/admin/photographers/${id}`);
        return response.data.data;
    },

    blockPhotographer: async (id: string, reason?: string): Promise<void> => {
        await apiClient.patch(`/admin/photographers/${id}/block`, { reason });
    },

    unblockPhotographer: async (id: string): Promise<void> => {
        await apiClient.patch(`/admin/photographers/${id}/unblock`);
    },

    // Application Management
    getApplications: async (params: GetPhotographersParams): Promise<PaginatedPhotographersResponse> => {
        const response = await apiClient.get("/admin/applications", { params });
        return response.data.data;
    },

    getApplicationById: async (id: string): Promise<Photographer> => {
        const response = await apiClient.get(`/admin/applications/${id}`);
        return response.data.data;
    },

    approveApplication: async (id: string, message: string): Promise<void> => {
        await apiClient.post(`/admin/applications/${id}/approve`, { message });
    },

    rejectApplication: async (id: string, reason: string): Promise<void> => {
        await apiClient.post(`/admin/applications/${id}/reject`, { reason });
    },

    // Statistics
    getStatistics: async (): Promise<PhotographerStats> => {
        const response = await apiClient.get("/admin/photographers/statistics");
        return response.data.data;
    },
};
