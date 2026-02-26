import apiClient from "../apiClient";
import type {
    CreateRentalItemData,
    IRentalItem,
    IRentalOrder,
    PaginatedResponse,
    ApiResponse,
    UnavailableDate,
    IRentalDashboardStats
} from "../../types/rental";
import { API_ROUTES } from "../../constants/apiRoutes";

export const rentalApi = {
    createItem: async (data: CreateRentalItemData): Promise<ApiResponse<IRentalItem>> => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('category', data.category);
        formData.append('condition', data.condition);
        formData.append('description', data.description);
        formData.append('pickupLocation', data.pickupLocation);
        formData.append('pricePerDay', data.pricePerDay.toString());
        formData.append('securityDeposit', data.securityDeposit.toString());
        formData.append('minRentalPeriod', data.minRentalPeriod.toString());

        data.images.forEach((file) => {
            formData.append('images', file);
        });

        const response = await apiClient.post(API_ROUTES.RENTAL.ITEMS, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getAllItems: async (category?: string, page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<IRentalItem>>> => {
        const response = await apiClient.get(API_ROUTES.RENTAL.ITEMS, {
            params: { category, page, limit }
        });
        return response.data;
    },

    getItemDetails: async (id: string): Promise<ApiResponse<IRentalItem>> => {
        const response = await apiClient.get(API_ROUTES.RENTAL.ITEM_DETAILS(id));
        return response.data;
    },

    getUserItems: async (page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<IRentalItem>>> => {
        const response = await apiClient.get(API_ROUTES.RENTAL.MY_ITEMS, {
            params: { page, limit }
        });
        return response.data;
    },

    getUserOrders: async (page: number = 1, limit: number = 10, search: string = '', status: string = ''): Promise<ApiResponse<PaginatedResponse<IRentalOrder>>> => {
        const response = await apiClient.get(API_ROUTES.RENTAL.ORDERS, {
            params: { page, limit, search, status }
        });
        return response.data;
    },

    getAdminItems: async (status: string, page: number = 1, limit: number = 10, search: string = ''): Promise<ApiResponse<PaginatedResponse<IRentalItem>>> => {
        const response = await apiClient.get(API_ROUTES.RENTAL.ADMIN_ITEMS, {
            params: { status, page, limit, search }
        });
        return response.data;
    },

    updateItemStatus: async (id: string, status: string): Promise<ApiResponse<IRentalItem>> => {
        const response = await apiClient.patch(API_ROUTES.RENTAL.ITEM_STATUS(id), { status });
        return response.data;
    },

    getOwnerOrders: async (page: number = 1, limit: number = 10, search: string = '', status: string = ''): Promise<ApiResponse<PaginatedResponse<IRentalOrder>>> => {
        const response = await apiClient.get(API_ROUTES.RENTAL.OWNER_ORDERS, {
            params: { page, limit, search, status }
        });
        return response.data;
    },

    getAllRentalOrders: async (page: number = 1, limit: number = 10, search: string = '', status: string = ''): Promise<ApiResponse<PaginatedResponse<IRentalOrder>>> => {
        const response = await apiClient.get(API_ROUTES.RENTAL.ADMIN_ORDERS, {
            params: { page, limit, search, status }
        });
        return response.data;
    },

    updateOrderStatus: async (orderId: string, status: string): Promise<ApiResponse<IRentalOrder>> => {
        const response = await apiClient.patch(API_ROUTES.RENTAL.UPDATE_ORDER_STATUS(orderId), { status });
        return response.data;
    },

    getOrderDetails: async (orderId: string): Promise<ApiResponse<IRentalOrder>> => {
        const response = await apiClient.get(API_ROUTES.RENTAL.ADMIN_ORDER_DETAILS(orderId));
        return response.data;
    },

    acceptOrder: async (orderId: string): Promise<ApiResponse<IRentalOrder>> => {
        const response = await apiClient.patch(API_ROUTES.RENTAL.ACCEPT(orderId));
        return response.data;
    },

    rejectOrder: async (orderId: string): Promise<ApiResponse<IRentalOrder>> => {
        const response = await apiClient.patch(API_ROUTES.RENTAL.REJECT(orderId));
        return response.data;
    },

    payDeposit: async (orderId: string, paymentIntentId: string): Promise<ApiResponse<IRentalOrder>> => {
        const response = await apiClient.patch(API_ROUTES.RENTAL.PAY(orderId), { paymentIntentId });
        return response.data;
    },

    createPaymentIntent: async (orderId: string): Promise<ApiResponse<{ url: string }>> => {
        const response = await apiClient.post(API_ROUTES.RENTAL.PAYMENT_INTENT(orderId));
        return response.data;
    },

    createBalancePaymentIntent: async (orderId: string): Promise<ApiResponse<{ clientSecret: string; url?: string }>> => {
        const response = await apiClient.post(API_ROUTES.RENTAL.BALANCE_PAYMENT_INTENT(orderId));
        return response.data;
    },

    payBalance: async (orderId: string, paymentIntentId: string): Promise<ApiResponse<IRentalOrder>> => {
        const response = await apiClient.post(API_ROUTES.RENTAL.PAY_BALANCE(orderId), { paymentIntentId });
        return response.data;
    },

    completeOrder: async (orderId: string): Promise<ApiResponse<IRentalOrder>> => {
        const response = await apiClient.patch(API_ROUTES.RENTAL.COMPLETE(orderId));
        return response.data;
    },

    rentItem: async (data: { itemIds: string[]; startDate: Date; endDate: Date; paymentIntentId?: string; paymentMethod: string }): Promise<ApiResponse<{ order: IRentalOrder; clientSecret?: string }>> => {
        const formData = new FormData();
        data.itemIds.forEach(id => formData.append('itemIds', id));
        formData.append('startDate', data.startDate.toISOString());
        formData.append('endDate', data.endDate.toISOString());
        formData.append('paymentMethod', data.paymentMethod);
        if (data.paymentIntentId) formData.append('paymentIntentId', data.paymentIntentId);

        const response = await apiClient.post(API_ROUTES.RENTAL.ORDERS, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    confirmRentalRequest: async (orderId: string, paymentIntentId: string): Promise<ApiResponse<IRentalOrder>> => {

        const response = await apiClient.post(API_ROUTES.RENTAL.CONFIRM_PAYMENT(orderId), { paymentIntentId });
        return response.data;
    },

    updateRentalItem: async (id: string, data: FormData): Promise<ApiResponse<IRentalItem>> => {
        const response = await apiClient.put(API_ROUTES.RENTAL.UPDATE(id), data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    checkAvailability: async (id: string, startDate: Date, endDate: Date): Promise<boolean> => {
        const response = await apiClient.get(API_ROUTES.RENTAL.ITEM_AVAILABILITY(id), {
            params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
        });
        return response.data.data.isAvailable;
    },

    getUnavailableDates: async (id: string): Promise<UnavailableDate[]> => {
        const response = await apiClient.get(API_ROUTES.RENTAL.ITEM_UNAVAILABLE(id));
        return response.data.data;
    },

    blockDates: async (id: string, startDate: Date, endDate: Date, reason: string): Promise<ApiResponse<IRentalItem>> => {
        const response = await apiClient.post(API_ROUTES.RENTAL.ITEM_BLOCK(id), {
            startDate, endDate, reason
        });
        return response.data;
    },

    unblockDates: (id: string, startDate: Date, endDate: Date): Promise<void> =>
        apiClient.post(API_ROUTES.RENTAL.ITEM_UNBLOCK(id), { startDate, endDate }),

    getDashboardStats: async (): Promise<ApiResponse<IRentalDashboardStats>> => {
        const response = await apiClient.get(API_ROUTES.RENTAL.STATS);
        return response.data;
    },

    requestReschedule: async (orderId: string, requestedStartDate: Date, requestedEndDate: Date, reason: string): Promise<ApiResponse<IRentalOrder>> => {
        const response = await apiClient.post(API_ROUTES.RENTAL.RESCHEDULE(orderId), {
            requestedStartDate,
            requestedEndDate,
            reason
        });
        return response.data;
    },

    respondToReschedule: async (orderId: string, action: 'approve' | 'reject'): Promise<ApiResponse<IRentalOrder>> => {
        const response = await apiClient.patch(API_ROUTES.RENTAL.RESCHEDULE_RESPOND(orderId), { action });
        return response.data;
    },

    cancelOrder: async (orderId: string, reason: string): Promise<ApiResponse<IRentalOrder>> => {
        const response = await apiClient.patch(API_ROUTES.RENTAL.CANCEL(orderId), { reason });
        return response.data;
    }
};

