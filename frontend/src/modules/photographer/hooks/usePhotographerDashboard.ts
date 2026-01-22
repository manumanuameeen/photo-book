import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';

export interface DashboardStats {
    earnings: {
        total: number;
        monthly: number;
        growth: number;
        pendingPayouts: number;
    };
    sessions: {
        total: number;
        newRequests: number;
    };
    reviews: {
        averageRating: number;
        totalReviews: number;
        latest: Array<{
            _id: string;
            clientName: string;
            comment: string;
            rating: number;
            createdAt: string;
        }>;
    };
    pendingRequests: Array<{
        _id: string;
        clientName: string;
        eventType: string;
        date: string;
        status: string;
    }>;
    upcomingBookings: Array<{
        _id: string;
        clientName: string;
        date: string;
        location: string;
        status: string;
    }>;
    recentMessages: Array<{
        _id: string;
        clientName: string;
        senderRole: string;
        message: string;
        time: string;
    }>;
}

export const usePhotographerDashboard = () => {
    return useQuery({
        queryKey: ["photographerDashboard"],
        queryFn: async () => {
            const res = await apiClient.get<{ data: DashboardStats }>("/photographer/dashboard");
            return res.data.data;
        }
    });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../../../services/api/bookingApi';
import { toast } from 'sonner';

export const useBookingActions = () => {
    const queryClient = useQueryClient();

    const acceptBooking = useMutation({
        mutationFn: ({ id, message }: { id: string; message?: string }) => bookingApi.acceptBooking(id, message),
        onSuccess: () => {
            toast.success("Booking accepted successfully");
            queryClient.invalidateQueries({ queryKey: ["photographerDashboard"] });
            queryClient.invalidateQueries({ queryKey: ["photographerBookings"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to accept booking");
        }
    });

    const rejectBooking = useMutation({
        mutationFn: ({ id, message }: { id: string; message?: string }) => bookingApi.rejectBooking(id, message),
        onSuccess: () => {
            toast.success("Booking rejected");
            queryClient.invalidateQueries({ queryKey: ["photographerDashboard"] });
            queryClient.invalidateQueries({ queryKey: ["photographerBookings"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to reject booking");
        }
    });

    const startWork = useMutation({
        mutationFn: ({ id }: { id: string }) => bookingApi.startWork(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['photographerDashboard'] });
            toast.success("Work started!");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to start work")
    });

    const endWork = useMutation({
        mutationFn: ({ id }: { id: string }) => bookingApi.endWork(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['photographerDashboard'] });
            toast.success("Work ended. Awaiting user confirmation.");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to end work")
    });

    const deliverWork = useMutation({
        mutationFn: ({ id }: { id: string }) => bookingApi.deliverWork(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['photographerDashboard'] });
            toast.success("Work delivered!");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to deliver work")
    });

    return { acceptBooking, rejectBooking, startWork, endWork, deliverWork };
};
