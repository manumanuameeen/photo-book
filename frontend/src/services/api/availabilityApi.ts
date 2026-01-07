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
    }
};
