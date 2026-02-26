import apiClient from "../apiClient";
import { API_ROUTES } from "../../constants/apiRoutes";

export interface IHelpTopicRequest {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    topic: string;
    description: string;
    status: "pending" | "reviewed" | "implemented";
    createdAt: string;
}

export const helpRequestApi = {
    submitRequest: async (data: { topic: string; description: string }): Promise<IHelpTopicRequest> => {
        const response = await apiClient.post(API_ROUTES.HELP_REQUEST.BASE, data);
        return response.data.data;
    },

    getAllRequests: async (): Promise<IHelpTopicRequest[]> => {
        const response = await apiClient.get(API_ROUTES.HELP_REQUEST.BASE);
        return response.data.data;
    },

    updateStatus: async (id: string, status: string): Promise<IHelpTopicRequest> => {
        const response = await apiClient.patch(API_ROUTES.HELP_REQUEST.STATUS(id), { status });
        return response.data.data;
    },
};
