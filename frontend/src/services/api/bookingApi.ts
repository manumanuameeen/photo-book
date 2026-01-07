import apiClient from "../apiClient";

export interface BookingDetails {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        profileImage?: string;
    };
    photographerId: {
        _id: string;
        name: string;
    };
    packageId: {
        _id: string;
        name: string;
        price: number;
    };
    eventDate: string;
    startTime: string;
    status: 'pending' | 'accepted' | 'waiting_for_deposit' | 'rejected' | 'cancelled' | 'completed';
    totalAmount: number;
    depositeRequired: number;
    paymentDeadline?: string;
    photographerMessage?: string;
    location: string;
    eventType: string;
    createdAt: string;
}

export const bookingApi = {
    // User - Get their own bookings
    // User - Get their own bookings with pagination
    getUserBookings: async (page: number = 1, limit: number = 10): Promise<{ bookings: BookingDetails[], total: number }> => {
        const response = await apiClient.get(`/booking/user/all?page=${page}&limit=${limit}`);
        return response.data.data;
    },

    // Photographer - Get their received bookings
    getPhotographerBookings: async (): Promise<BookingDetails[]> => {
        const response = await apiClient.get('/booking/photographer/all');
        return response.data.data;
    },

    // Actions
    acceptBooking: async (bookingId: string, message?: string): Promise<BookingDetails> => {
        const response = await apiClient.patch(`/booking/${bookingId}/accept`, { message });
        return response.data.data;
    },

    confirmPayment: async (bookingId: string): Promise<BookingDetails> => {
        const response = await apiClient.patch(`/booking/${bookingId}/pay`);
        return response.data.data;
    },

    rejectBooking: async (bookingId: string, message?: string): Promise<BookingDetails> => {
        const response = await apiClient.patch(`/booking/${bookingId}/reject`, { message });
        return response.data.data;
    },

    cancelBooking: async (bookingId: string): Promise<BookingDetails> => {
        const response = await apiClient.patch(`/booking/${bookingId}/cancel`);
        return response.data.data;
    },

    getBookingDetails: async (bookingId: string): Promise<BookingDetails> => {
        const response = await apiClient.get(`/booking/${bookingId}`);
        return response.data.data;
    },

    createBooking: async (data: any): Promise<BookingDetails> => {
        const response = await apiClient.post('/booking/', data);
        return response.data.data;
    }
};
