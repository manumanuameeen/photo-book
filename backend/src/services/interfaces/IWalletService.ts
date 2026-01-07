import { IWallet } from "../../model/walletModel";

export interface IWalletService {
    createWallet(userId: string, role: string): Promise<IWallet>;
    getWallet(userId: string): Promise<IWallet | null>;
    creditWallet(userId: string, amount: number, description: string, refId: string): Promise<IWallet>;
    debitWallet(userId: string, amount: number, description: string, refId: string): Promise<IWallet>;
    ensureWalletExists(userId: string, role: string): Promise<IWallet>;
}
