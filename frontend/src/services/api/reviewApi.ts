import apiClient from "../apiClient";
import type { Review, ReviewStats, ReviewUpdatePayload } from "../../types/review";
import { API_ROUTES } from "../../constants/apiRoutes";

export type { Review, ReviewStats, ReviewUpdatePayload };

export const reviewApi = {
    addReview: async (targetId: string, type: string, rating: number, comment: string) => {
        const response = await apiClient.post(API_ROUTES.REVIEW.BASE, { targetId, type, rating, comment });
        return response.data.data;
    },
    getReviews: async (targetId: string, page: number = 1, limit: number = 5) => {
        const response = await apiClient.get(API_ROUTES.REVIEW.DETAILS(targetId), {
            params: { page, limit }
        });
        return response.data.data;
    },
    getStats: async (targetId: string) => {
        const response = await apiClient.get(API_ROUTES.REVIEW.STATS(targetId));
        return response.data.data;
    },
    replyToReview: async (reviewId: string, comment: string) => {
        const response = await apiClient.patch(API_ROUTES.REVIEW.REPLY(reviewId), { comment });
        return response.data.data;
    },
    toggleLikeReview: async (reviewId: string) => {
        const response = await apiClient.patch(API_ROUTES.REVIEW.LIKE(reviewId));
        return response.data.data;
    },
    deleteReview: async (reviewId: string) => {
        await apiClient.delete(API_ROUTES.REVIEW.DETAILS(reviewId));
    },
    updateReview: async (reviewId: string, payload: ReviewUpdatePayload) => {
        const response = await apiClient.patch(API_ROUTES.REVIEW.DETAILS(reviewId), payload);
        return response.data.data as Review;
    },
    getUserReviews: async (page: number = 1, limit: number = 10, search?: string) => {
        const response = await apiClient.get(API_ROUTES.REVIEW.MY_REVIEWS, {
            params: { page, limit, search }
        });
        return response.data.data;
    },
    getReceivedReviews: async (page: number = 1, limit: number = 10, search?: string) => {
        const response = await apiClient.get(API_ROUTES.REVIEW.RECEIVED_REVIEWS, {
            params: { page, limit, search }
        });
        return response.data.data;
    }
};
