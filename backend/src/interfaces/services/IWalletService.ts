import { IWallet, ITransaction } from "../../models/wallet.model";

export interface IWalletService {
  createWallet(userId: string, role: string): Promise<IWallet>;
  getWallet(userId: string): Promise<IWallet | null>;
  creditWallet(
    userId: string,
    amount: number,
    description: string,
    refId: string,
    customerName?: string,
    providerName?: string,
  ): Promise<IWallet>;
  debitWallet(
    userId: string,
    amount: number,
    description: string,
    refId: string,
    customerName?: string,
    providerName?: string,
  ): Promise<IWallet>;
  ensureWalletExists(userId: string, role: string): Promise<IWallet>;
  creditPending(
    userId: string,
    amount: number,
    description: string,
    refId: string,
    customerName?: string,
    providerName?: string,
  ): Promise<IWallet>;
  releasePending(userId: string, refId: string): Promise<IWallet>;
  getWalletTransactions(
    userId: string,
    page?: number,
    limit?: number,
    type?: string,
    status?: string,
  ): Promise<{ transactions: ITransaction[]; total: number; balance: number }>;
}
