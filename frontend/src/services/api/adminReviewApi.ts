import axiosInstance from "../apiClient";

export interface AdminReview {
    id: string;
    reviewerId: {
        _id: string;
        name: string;
        email: string;
    };
    reviewerName: string;
    targetId: string;
    targetName: string;
    targetImage?: string;
    rating: number;
    comment: string;
    type: 'photographer' | 'rental' | 'package';
    createdAt: string;
    ownerReply?: string;
}

export interface PaginatedReviews {
    reviews: AdminReview[];
    total: number;
}

export const adminReviewApi = {
    getAll: async (params: {
        page?: number;
        limit?: number;
        search?: string;
        rating?: number;
        type?: string;
    }): Promise<PaginatedReviews> => {
        const response = await axiosInstance.get('/admin/reviews', { params });
        return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/admin/reviews/${id}`);
    },
};
