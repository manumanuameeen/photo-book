import apiClient from "../apiClient";
import type {
    GetPhotographersParams,
    PaginatedPhotographersResponse,
    Photographer,
    PhotographerStats
} from "../../modules/admin/types/photographer.types";

export const adminPhotographerApi = {
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

    getStatistics: async (): Promise<PhotographerStats> => {
        const response = await apiClient.get("/admin/photographers/stats");
        return response.data.data;
    },

    getPackages: async (page = 1, limit = 10, status = "ALL"): Promise<any> => {
        const response = await apiClient.get("/admin/packages", { params: { page, limit, status } });
        return response.data.data;
    },

    approvePackage: async (id: string): Promise<void> => {
        await apiClient.post(`/admin/packages/${id}/approve`);
    },

    rejectPackage: async (id: string, reason: string): Promise<void> => {
        await apiClient.post(`/admin/packages/${id}/reject`, { reason });
    },

    blockPackage: async (id: string, reason: string): Promise<void> => {
        await apiClient.patch(`/admin/packages/${id}/block`, { reason });
    },

    unblockPackage: async (id: string): Promise<void> => {
        await apiClient.patch(`/admin/packages/${id}/unblock`);
    },
};
