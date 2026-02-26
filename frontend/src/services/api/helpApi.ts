import apiClient from "../apiClient";
import { API_ROUTES } from "../../constants/apiRoutes";

export interface IHelpStep {
    title: string;
    description: string;
    order: number;
}

export interface IHelpContent {
    _id: string;
    title: string;
    description: string;
    category: string;
    icon: string;
    order: number;
    steps: IHelpStep[];
    isActive: boolean;
}

export const helpApi = {
    getAllHelp: async (): Promise<IHelpContent[]> => {
        const response = await apiClient.get(API_ROUTES.HELP.BASE);
        return response.data.data;
    },

    getHelpByCategory: async (category: string): Promise<IHelpContent> => {
        const response = await apiClient.get(API_ROUTES.HELP.CATEGORY(category));
        return response.data.data;
    },

    createHelpSection: async (data: Partial<IHelpContent>): Promise<IHelpContent> => {
        const response = await apiClient.post(API_ROUTES.HELP.BASE, data);
        return response.data.data;
    },

    updateHelpSection: async (id: string, data: Partial<IHelpContent>): Promise<IHelpContent> => {
        const response = await apiClient.put(API_ROUTES.HELP.DETAILS(id), data);
        return response.data.data;
    },

    deleteHelpSection: async (id: string): Promise<void> => {
        await apiClient.delete(API_ROUTES.HELP.DETAILS(id));
    },

    reorderHelpSections: async (id: string, newOrder: number): Promise<IHelpContent> => {
        const response = await apiClient.patch(API_ROUTES.HELP.REORDER(id), { newOrder });
        return response.data.data;
    },
};
