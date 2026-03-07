import axiosInstance from "../apiClient";
import { API_ROUTES } from "../../constants/apiRoutes";

export interface DashboardStats {
    topMetrics: {
        title: string;
        value: string;
        trend: string;
        trendColor: 'positive' | 'negative' | 'neutral';
        icon: string;
        iconBgColor: string;
    }[];
    smallMetrics: {
        title: string;
        value: string;
        trend: string;
        trendColor: 'positive' | 'negative' | 'neutral';
        icon: string;
        iconBgColor: string;
        isSmall: boolean;
    }[];
    activities: {
        id: string;
        icon: string;
        title: string;
        detail: string;
        borderColor: string;
        time: string;
    }[];
    revenueTrend: {
        name: string;
        amount: number;
    }[];
    bookingsTrend: {
        name: string;
        count: number;
    }[];
    alerts: {
        type: 'warning' | 'error' | 'info';
        title: string;
        detail: string;
    }[];
    categoryDistribution: {
        name: string;
        value: number;
        color: string;
    }[];
    revenueSplit: {
        name: string;
        value: number;
        color: string;
    }[];
    topPhotographers: {
        id: string;
        name: string;
        image?: string;
        rating: number;
        reviews: number;
        bookings: number;
    }[];
    topRentalOwners: {
        id: string;
        name: string;
        image?: string;
        revenue: number;
        orders: number;
        items: number;
    }[];
    topRegions: {
        name: string;
        value: number;
    }[];
    recentReviews: {
        id: string;
        reviewerName: string;
        rating: number;
        comment: string;
        createdAt: string;
        targetName: string;
    }[];
    pendingReportsCount?: number;
}

export const adminDashboardApi = {
    getStats: async (startDate?: string, endDate?: string): Promise<DashboardStats> => {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await axiosInstance.get(API_ROUTES.ADMIN.DASHBOARD, { params });
        return response.data.data;
    },
};
