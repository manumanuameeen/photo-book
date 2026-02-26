import apiClient from "../apiClient";
import { API_ROUTES } from "../../constants/apiRoutes";

export const CategoryType = {
    WEDDING: 'Wedding',
    PORTRAIT: 'Portrait',
    EVENT: 'Event',
    LIFESTYLE: 'Lifestyle',
    OTHER: 'Other'
} as const;

export type CategoryType = typeof CategoryType[keyof typeof CategoryType];

export interface Category {
    _id: string;
    name: string;
    type: CategoryType | string;
    description: string;
    explanation?: string;
    isBlocked: boolean;
    isActive: boolean;
    isSuggested?: boolean;
}

export const adminCategoryApi = {
    getCategories: async (search?: string, page = 1, limit = 10, isBlocked: "true" | "false" | "all" = "all", isSuggested?: "true" | "false", isActive: "true" | "false" | "all" = "all") => {
        const response = await apiClient.get(API_ROUTES.ADMIN.CATEGORIES, {
            params: { search, page, limit, isBlocked, isSuggested, isActive }
        });

        return response.data.data;
    },

    createCategory: async (data: Partial<Category>) => {
        const response = await apiClient.post(API_ROUTES.ADMIN.CATEGORY, data);
        return response.data;
    },

    updateCategory: async (id: string, data: Partial<Category>) => {
        const response = await apiClient.put(API_ROUTES.ADMIN.CATEGORY_DETAILS(id), data);
        return response.data;
    },

    deleteCategory: async (id: string) => {
        const response = await apiClient.delete(API_ROUTES.ADMIN.CATEGORY_DETAILS(id));
        return response.data;
    },
    approveCategory: async (id: string, message?: string) => {
        const response = await apiClient.post(API_ROUTES.ADMIN.CATEGORY_APPROVE(id), { message });
        return response.data;
    },
    rejectCategory: async (id: string, reason: string) => {
        const response = await apiClient.post(API_ROUTES.ADMIN.CATEGORY_REJECT(id), { reason });
        return response.data;
    }
};
