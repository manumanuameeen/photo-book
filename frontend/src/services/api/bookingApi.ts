import apiClient from "../apiClient";
import { API_ROUTES } from "../../constants/apiRoutes";

export interface BookingDetails {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        profileImage?: string;
        phoneNumber?: string;
    };
    photographerId: {
        _id: string;
        name: string;
        email: string;
        profileImage?: string;
        username?: string;
    };
    packageId: {
        _id: string;
        name: string;
        price: number;
        features?: string[];
    };
    eventDate: string;
    startTime: string;
    endTime?: string;
    duration?: number;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    status: 'pending' | 'accepted' | 'waiting_for_deposit' | 'deposit_paid' | 'work_started' | 'work_ended_pending' | 'work_ended' | 'work_delivered' | 'rejected' | 'cancelled' | 'completed';
    paymentStatus?: 'pending' | 'deposit_paid' | 'full_paid' | 'refunded';
    totalAmount: number;
    depositeRequired: number;
    paymentDeadline?: string;
    photographerMessage?: string;
    location: string;
    eventType: string;
    createdAt: string;
    rescheduleRequest?: {
        requestedDate: string;
        requestedStartTime: string;
        reason: string;
        status: 'pending' | 'accepted' | 'rejected' | 'expired';
        createdAt: string;
    };
    deliveryWorkLink?: string;
}

export interface CreateBookingData extends Omit<Partial<BookingDetails>, 'userId' | 'photographerId' | 'packageId'> {
    photographerId: string;
    packageId: string | null;
    packageName: string;
    packagePrice: number;
    packageFeatures?: string[];
    date?: string;
}

export const bookingApi = {

    getUserBookings: async (page: number = 1, limit: number = 10, search: string = '', status: string = ''): Promise<{ bookings: BookingDetails[], total: number }> => {
        const response = await apiClient.get(`${API_ROUTES.BOOKING.USER_ALL}?page=${page}&limit=${limit}&search=${search}&status=${status}`);
        return response.data.data;
    },

    getPhotographerBookings: async (): Promise<BookingDetails[]> => {
        const response = await apiClient.get(API_ROUTES.BOOKING.PHOTOGRAPHER_ALL);
        return response.data.data;
    },

    acceptBooking: async (bookingId: string, message?: string): Promise<BookingDetails> => {
        const response = await apiClient.patch(API_ROUTES.BOOKING.ACCEPT(bookingId), { message });
        return response.data.data;
    },

    createPaymentIntent: async (bookingId: string): Promise<{ url: string; clientSecret: string }> => {
        const response = await apiClient.post(API_ROUTES.BOOKING.PAYMENT_INTENT(bookingId));
        return response.data.data;
    },

    confirmPayment: async (bookingId: string, paymentIntentId?: string): Promise<BookingDetails> => {
        const response = await apiClient.patch(API_ROUTES.BOOKING.PAY(bookingId), { paymentIntentId });
        return response.data.data;
    },

    rejectBooking: async (bookingId: string, message?: string): Promise<BookingDetails> => {
        const response = await apiClient.patch(API_ROUTES.BOOKING.REJECT(bookingId), { message });
        return response.data.data;
    },

    cancelBooking: async (bookingId: string, reason?: string, isEmergency?: boolean): Promise<BookingDetails> => {
        const response = await apiClient.patch(API_ROUTES.BOOKING.CANCEL(bookingId), { reason, isEmergency });
        return response.data.data;
    },

    getBookingDetails: async (bookingId: string): Promise<BookingDetails> => {
        const response = await apiClient.get(API_ROUTES.BOOKING.DETAILS(bookingId));
        return response.data.data;
    },

    createBooking: async (data: CreateBookingData): Promise<BookingDetails> => {
        const response = await apiClient.post(API_ROUTES.BOOKING.BASE, data);
        return response.data.data;
    },

    completeBooking: async (bookingId: string): Promise<BookingDetails> => {
        const response = await apiClient.patch(API_ROUTES.BOOKING.COMPLETE(bookingId));
        return response.data.data;
    },

    startWork: async (bookingId: string): Promise<BookingDetails> => {
        const response = await apiClient.patch(API_ROUTES.BOOKING.START_WORK(bookingId));
        return response.data.data;
    },

    endWork: async (bookingId: string): Promise<BookingDetails> => {
        const response = await apiClient.patch(API_ROUTES.BOOKING.END_WORK(bookingId));
        return response.data.data;
    },

    deliverWork: async (bookingId: string, deliveryLink: string): Promise<BookingDetails> => {
        const response = await apiClient.patch(API_ROUTES.BOOKING.DELIVER_WORK(bookingId), { deliveryLink });
        console.log(response)
        console.log(response.data)

        console.log(response.data.data)
        return response.data.data;
    },

    confirmEndWork: async (bookingId: string): Promise<BookingDetails> => {
        const response = await apiClient.patch(API_ROUTES.BOOKING.CONFIRM_END_WORK(bookingId));
        return response.data.data;
    },

    confirmDelivery: async (bookingId: string): Promise<BookingDetails> => {
        const response = await apiClient.patch(API_ROUTES.BOOKING.CONFIRM_DELIVERY(bookingId));
        return response.data.data;
    },

    requestReschedule: async (bookingId: string, data: { newDate: Date; newStartTime: string; reason: string }): Promise<BookingDetails> => {
        const response = await apiClient.post(API_ROUTES.BOOKING.RESCHEDULE_REQUEST(bookingId), data);
        return response.data.data;
    },

    respondToReschedule: async (bookingId: string, decision: 'accepted' | 'rejected'): Promise<BookingDetails> => {
        const response = await apiClient.post(API_ROUTES.BOOKING.RESCHEDULE_RESPONSE(bookingId), { decision });
        return response.data.data;
    }
};
