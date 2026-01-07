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

export const walletApi = {
    getWalletDetails: async (): Promise<WalletDetails> => {
        const response = await apiClient.get('/wallet');
        return response.data.data;
    }
};
