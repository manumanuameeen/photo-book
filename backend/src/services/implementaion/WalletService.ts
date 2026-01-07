import { IWalletService } from "../interfaces/IWalletService";
import { IWalletRepository } from "../../repositories/implementaion/wallet/WalletRepository";
import { IWallet } from "../../model/walletModel";

export class WalletService implements IWalletService {
    private walletRepository: IWalletRepository;

    constructor(walletRepository: IWalletRepository) {
        this.walletRepository = walletRepository;
    }

    async createWallet(userId: string, role: string): Promise<IWallet> {
        const existing = await this.walletRepository.findByUser(userId);
        if (existing) return existing;
        return await this.walletRepository.createWallet(userId, role);
    }

    async getWallet(userId: string): Promise<IWallet | null> {
        let wallet = await this.walletRepository.findByUser(userId);

        return wallet;
    }

    async creditWallet(userId: string, amount: number, description: string, refId: string): Promise<IWallet> {
        let targetId = userId;
        if (userId === 'admin') {
            const adminWallet = await this.ensureWalletExists('admin', 'admin');
            targetId = adminWallet.userId.toString();
        }

        await this.walletRepository.updateBalance(targetId, amount);

        const transaction = {
            type: 'CREDIT',
            amount: amount,
            description: description,
            referenceId: refId,
            date: new Date(),
            status: 'COMPLETED'
        };

        return (await this.walletRepository.addTransaction(targetId, transaction))!;
    }

    async ensureWalletExists(userId: string, role: string): Promise<IWallet> {
        if (userId === 'admin') {
            const adminWallet = await this.walletRepository.findByRole('admin');
            if (adminWallet) return adminWallet;

            // Try to find an admin user to create a wallet for
            const { User } = await import('../../model/userModel');
            const adminUser = (await User.findOne({ role: 'admin' })) as any;

            if (adminUser) {
                console.log(`[WalletService] Creating missing wallet for admin user ${adminUser._id}`);
                return await this.walletRepository.createWallet(adminUser._id.toString(), 'admin');
            } else {
                throw new Error("Admin wallet not found and no Admin user exists to create one.");
            }
        }

        const existing = await this.walletRepository.findByUser(userId);
        if (existing) return existing;
        return await this.walletRepository.createWallet(userId, role);
    }

    async debitWallet(userId: string, amount: number, description: string, refId: string): Promise<IWallet> {
        const wallet = await this.walletRepository.findByUser(userId);
        if (!wallet || wallet.balance < amount) {
            throw new Error("Insufficient wallet balance");
        }

        await this.walletRepository.updateBalance(userId, -amount);

        const transaction = {
            type: 'DEBIT',
            amount: amount,
            description: description,
            referenceId: refId,
            date: new Date(),
            status: 'COMPLETED'
        };

        return (await this.walletRepository.addTransaction(userId, transaction))!;
    }
}
