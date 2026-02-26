
import axiosInstance from "../apiClient";
import { API_ROUTES } from "../../constants/apiRoutes";

export interface IRule {
    _id: string;
    title: string;
    description: string;
    category: 'booking' | 'rental' | 'general';
    type: 'reschedule' | 'cancel' | 'fine' | 'info';
    amount?: number;
    icon: string;
    isActive: boolean;
}

export const rulesApi = {
    getAllRules: async (): Promise<IRule[]> => {
        const response = await axiosInstance.get(API_ROUTES.RULES.BASE);
        return response.data.data || response.data;
    },

    getRulesByCategory: async (category: string): Promise<IRule[]> => {
        const response = await axiosInstance.get(`${API_ROUTES.RULES.BASE}?category=${category}`);
        return response.data.data || response.data;
    }
};
