import apiClient from "../apiClient";
import { API_ROUTES } from "../../constants/apiRoutes";
import type {
    GetPhotographersParams,
    PaginatedPhotographersResponse,
    Photographer,
    PhotographerStats,
    IAdminPackage
} from "../../modules/admin/types/photographer.types";

export const adminPhotographerApi = {
    getPhotographers: async (params: GetPhotographersParams): Promise<PaginatedPhotographersResponse> => {
        const response = await apiClient.get(API_ROUTES.ADMIN.PHOTOGRAPHERS, { params });

        return response.data.data;
    },

    getPhotographerById: async (id: string): Promise<Photographer> => {
        const response = await apiClient.get(API_ROUTES.ADMIN.PHOTOGRAPHER_DETAILS(id));
        return response.data.data;
    },

    blockPhotographer: async (id: string, reason?: string): Promise<void> => {
        await apiClient.patch(API_ROUTES.ADMIN.PHOTOGRAPHER_BLOCK(id), { reason });
    },

    unblockPhotographer: async (id: string): Promise<void> => {
        await apiClient.patch(API_ROUTES.ADMIN.PHOTOGRAPHER_UNBLOCK(id));
    },

    getApplications: async (params: GetPhotographersParams): Promise<PaginatedPhotographersResponse> => {
        const response = await apiClient.get(API_ROUTES.ADMIN.APPLICATIONS, { params });
        return response.data.data;
    },

    getApplicationById: async (id: string): Promise<Photographer> => {
        const response = await apiClient.get(API_ROUTES.ADMIN.APPLICATION_DETAILS(id));
        return response.data.data;
    },

    approveApplication: async (id: string, message: string): Promise<void> => {
        await apiClient.post(API_ROUTES.ADMIN.APPLICATION_APPROVE(id), { message });
    },

    rejectApplication: async (id: string, reason: string): Promise<void> => {
        await apiClient.post(API_ROUTES.ADMIN.APPLICATION_REJECT(id), { reason });
    },

    getStatistics: async (): Promise<PhotographerStats> => {
        const response = await apiClient.get(API_ROUTES.ADMIN.PHOTOGRAPHER_STATS);
        return response.data.data;
    },

    getPackages: async (page = 1, limit = 10, status = "ALL"): Promise<{ packages: IAdminPackage[]; total: number }> => {
        const response = await apiClient.get(API_ROUTES.ADMIN.PACKAGES, { params: { page, limit, status } });
        return response.data.data;
    },

    approvePackage: async (id: string): Promise<void> => {
        await apiClient.post(API_ROUTES.ADMIN.PACKAGE_APPROVE(id));
    },

    rejectPackage: async (id: string, reason: string): Promise<void> => {
        await apiClient.post(API_ROUTES.ADMIN.PACKAGE_REJECT(id), { reason });
    },

    blockPackage: async (id: string, reason: string): Promise<void> => {
        await apiClient.patch(API_ROUTES.ADMIN.PACKAGE_BLOCK(id), { reason });
    },

    unblockPackage: async (id: string): Promise<void> => {
        await apiClient.patch(API_ROUTES.ADMIN.PACKAGE_UNBLOCK(id));
    },
};
