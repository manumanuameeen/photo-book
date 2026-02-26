import apiClient from "../apiClient";
import { API_ROUTES } from "../../constants/apiRoutes";

interface AvailabilityData {
    date?: string;
    slots?: unknown[];
    isFullDayAvailable?: boolean;
    startDate?: string;
    endDate?: string;
    isAvailable?: boolean;
    [key: string]: string | boolean | number | unknown[] | undefined;
}

export const availabilityApi = {
    setAvailability: async (data: AvailabilityData) => {
        const response = await apiClient.post(API_ROUTES.PHOTOGRAPHER.AVAILABILITY, data);
        return response.data.data;
    },

    getAvailability: async (startDate: string, endDate: string) => {
        const response = await apiClient.get(API_ROUTES.PHOTOGRAPHER.AVAILABILITY, {
            params: { startDate, endDate }
        });
        return response.data.data;
    },

    blockRange: async (startDate: string, endDate: string) => {
        const response = await apiClient.post(API_ROUTES.PHOTOGRAPHER.AVAILABILITY_BLOCK, {
            startDate,
            endDate
        });
        return response.data.data;
    },

    unblockRange: async (startDate: string, endDate: string) => {
        const response = await apiClient.post(API_ROUTES.PHOTOGRAPHER.AVAILABILITY_UNBLOCK, {
            startDate,
            endDate
        });
        return response.data.data;
    },

    updateSettings: async (settings: { noticeInterval?: string, bufferTime?: string }) => {
        const response = await apiClient.put(API_ROUTES.PHOTOGRAPHER.PROFILE, {
            professionalDetails: settings
        });
        return response.data.data;
    }
};
