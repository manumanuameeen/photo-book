import apiClient from "../apiClient";
import { API_ROUTES } from "../../constants/apiRoutes";

export interface IReportCategory {
    _id: string;
    name: string;
    description?: string;
    isActive: boolean;
    subReasons: string[];
}

export interface CreateReportCategoryDTO {
    name: string;
    description?: string;
    subReasons?: string[];
}

export const adminReportCategoryApi = {
    getCategories: async (): Promise<IReportCategory[]> => {
        const response = await apiClient.get(API_ROUTES.REPORT_CATEGORY.BASE);
        return response.data.data;
    },

    createCategory: async (data: CreateReportCategoryDTO): Promise<IReportCategory> => {
        const response = await apiClient.post(API_ROUTES.REPORT_CATEGORY.BASE, data);
        return response.data.data;
    },

    updateCategory: async (id: string, data: Partial<CreateReportCategoryDTO> & { isActive?: boolean }): Promise<IReportCategory> => {
        const response = await apiClient.patch(API_ROUTES.REPORT_CATEGORY.DETAILS(id), data);
        return response.data.data;
    },

    deleteCategory: async (id: string): Promise<void> => {
        await apiClient.delete(API_ROUTES.REPORT_CATEGORY.DETAILS(id));
    }
};
