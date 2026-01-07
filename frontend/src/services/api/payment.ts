import axiosInstance from "../apiClient";

export const paymentApi = {
    createPaymentIntent: async (amount: number, currency: string = "usd") => {
        const response = await axiosInstance.post("/payment/create-intent", { amount, currency });
        return response.data;
    },

    confirmPayment: async (paymentIntentId: string, userId: string, amount: number, description?: string) => {
        const response = await axiosInstance.post("/payment/confirm", { paymentIntentId, userId, amount, description });
        return response.data;
    },
};
