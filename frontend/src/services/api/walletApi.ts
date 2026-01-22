import apiClient from "../apiClient";

export interface WalletTransaction {
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    description: string;
    referenceId?: string;
    date: string;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export interface WalletDetails {
    _id: string;
    userId: string;
    balance: number;
    transactions: WalletTransaction[];
}

export interface EscrowBooking {
    _id: string;
    totalAmount: number;
    createdAt: string;
    status: string;
    paymentStatus: string;
    userId: {
        name: string;
        email: string;
        profileImage?: string;
    };
    photographerId: {
        name: string;
        profileImage?: string;
    };
    packageDetails: {
        name: string;
    };
    eventType: string;
}

export interface EscrowRental {
    _id: string;
    totalAmount: number;
    createdAt: string;
    status: string;
    paymentStatus: string;
    renterId: {
        name: string;
        email: string;
        profileImage?: string;
    };
    items: {
        ownerId: {
            name: string;
            profileImage?: string;
        };
    }[];
}

export interface DashboardStats {
    volume: number;
    revenue: number;
    escrow: number;
    payouts: number;
}

export const walletApi = {
    getWalletDetails: async (): Promise<WalletDetails> => {
        const response = await apiClient.get('/wallet');
        return response.data.data;
    },
    getDashboardStats: async (): Promise<DashboardStats> => {
        const response = await apiClient.get('/wallet/dashboard-stats');
        return response.data.data;
    },
    getEscrowStats: async (page: number, limit: number, search: string) => {
        const response = await apiClient.get('/wallet/escrow-stats', {
            params: { page, limit, search }
        });
        return response.data.data;
    },
    getWalletTransactions: async (page: number, limit: number, filter: string) => {
        const response = await apiClient.get('/wallet/transactions', {
            params: { page, limit, filter }
        });
        return response.data.data;
    }
};
