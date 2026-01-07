
import { WalletModel, IWallet } from "../../../model/walletModel";

export interface IWalletRepository {
    createWallet(userId: string, role: string): Promise<IWallet>;
    findByUser(userId: string): Promise<IWallet | null>;
    findByRole(role: string): Promise<IWallet | null>;
    updateBalance(userId: string, amount: number): Promise<IWallet | null>; // Returns updated wallet
    addTransaction(userId: string, transaction: any): Promise<IWallet | null>;
}

export class WalletRepository implements IWalletRepository {
    async createWallet(userId: string, role: string): Promise<IWallet> {
        return await WalletModel.create({ userId, role, balance: 0, transaction: [] });
    }

    async findByUser(userId: string): Promise<IWallet | null> {
        return await WalletModel.findOne({ userId });
    }

    async findByRole(role: string): Promise<IWallet | null> {
        return await WalletModel.findOne({ role });
    }

    async updateBalance(userId: string, amount: number): Promise<IWallet | null> {
        return await WalletModel.findOneAndUpdate(
            { userId },
            { $inc: { balance: amount } },
            { new: true }
        );
    }

    async addTransaction(userId: string, transaction: any): Promise<IWallet | null> {
        return await WalletModel.findOneAndUpdate(
            { userId },
            { $push: { transaction: transaction } },
            { new: true }
        );
    }
}
