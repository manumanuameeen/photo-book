import axiosInstance from "../apiClient";
import { API_ROUTES } from "../../constants/apiRoutes";

export const paymentApi = {
    createPaymentIntent: async (amount: number, currency: string = "usd") => {
        const response = await axiosInstance.post(API_ROUTES.PAYMENT.CREATE_INTENT, { amount, currency });
        return response.data;
    },

    confirmPayment: async (paymentIntentId: string, userId: string, amount: number, description?: string) => {
        const response = await axiosInstance.post(API_ROUTES.PAYMENT.CONFIRM, { paymentIntentId, userId, amount, description });
        return response.data;
    },
};
