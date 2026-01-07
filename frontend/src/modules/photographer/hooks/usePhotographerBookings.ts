import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';

export interface Booking {
    _id: string;
    clientName: string;
    clientImage?: string;
    clientEmail?: string;
    packageName: string;
    packagePrice: number;
    eventDate: string;
    eventType: string;
    location: string;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
    paymentStatus: string;
    createdAt: string;
}

interface BookingsResponse {
    bookings: Booking[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const usePhotographerBookings = (status: string = 'all', page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ['photographerBookings', status, page, limit],
        queryFn: async () => {
            const res = await apiClient.get<{ data: BookingsResponse }>(`/photographer/bookings`, {
                params: { status, page, limit }
            });
            return res.data.data;
        }
    });
};
