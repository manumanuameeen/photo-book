import apiClient from "../apiClient";

export const availabilityApi = {
    setAvailability: async (data: any) => {
        const response = await apiClient.post("/photographer/availability", data);
        return response.data.data;
    },

    getAvailability: async (startDate: string, endDate: string) => {
        const response = await apiClient.get("/photographer/availability", {
            params: { startDate, endDate }
        });
        return response.data.data;
    },

    blockRange: async (startDate: string, endDate: string) => {
        const response = await apiClient.post("/photographer/availability/block-range", {
            startDate,
            endDate
        });
        return response.data.data;
    },

    unblockRange: async (startDate: string, endDate: string) => {
        const response = await apiClient.post("/photographer/availability/unblock-range", {
            startDate,
            endDate
        });
        return response.data.data;
    },

    updateSettings: async (settings: { noticeInterval?: string, bufferTime?: string }) => {
        const response = await apiClient.put("/photographer/profile", {
            professionalDetails: settings
        });
        return response.data.data;
    }
};
