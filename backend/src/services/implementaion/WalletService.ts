import { HttpStatus } from "../../constants/httpStatus.ts";
import { Messages } from "../../constants/messages.ts";
import { IWalletRepository } from "../../interfaces/repositories/IWalletRepository.ts";
import { IWalletService } from "../../interfaces/services/IWalletService.ts";
import { IWallet, ITransaction } from "../../model/walletModel.ts";
import { AppError } from "../../utils/AppError.ts";

export class WalletService implements IWalletService {
  private readonly _walletRepository: IWalletRepository;

  constructor(walletRepository: IWalletRepository) {
    this._walletRepository = walletRepository;
  }

  async createWallet(userId: string, role: string): Promise<IWallet> {
    const targetId = await this._resolveUserId(userId);
    const existing = await this._walletRepository.findByUser(targetId);
    if (existing) return existing;
    return await this._walletRepository.createWallet(targetId, role);
  }

  async getWallet(userId: string): Promise<IWallet | null> {
    const targetId = await this._resolveUserId(userId);
    const wallet = await this._walletRepository.findByUser(targetId);
    return wallet;
  }

  private async _resolveUserId(userId: string): Promise<string> {
    if (userId === "admin") {
      const adminWallet = await this._walletRepository.findByRole("admin");
      if (adminWallet) return adminWallet.userId.toString();

      const { User } = await import("../../model/userModel.ts");
      const adminUser = await User.findOne({ role: "admin" });
      if (adminUser) {
        return String(adminUser._id);
      }
      throw new AppError(Messages.ADMIN_WALLET_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }
    return userId;
  }

  async getWalletTransactions(
    userId: string,
    page: number = 1,
    limit: number = 10,
    type?: string,
    status?: string,
  ): Promise<{ transactions: ITransaction[]; total: number; balance: number }> {
    const targetId = await this._resolveUserId(userId);
    const wallet = await this.ensureWalletExists(targetId, userId === "admin" ? "admin" : "user");
    const { transactions, total } = await this._walletRepository.getTransactions(
      wallet.userId.toString(),
      page,
      limit,
      type,
      status,
    );

    return {
      transactions,
      total,
      balance: wallet.balance,
    };
  }

  async creditWallet(
    userId: string,
    amount: number,
    description: string,
    refId: string,
  ): Promise<IWallet> {
    const targetId = await this._resolveUserId(userId);
    const wallet = await this.ensureWalletExists(targetId, userId === "admin" ? "admin" : "user");

    if (
      wallet.transaction &&
      wallet.transaction.some(
        (t: ITransaction) =>
          t.referenceId === refId && t.type === "CREDIT" && t.description === description,
      )
    ) {
      console.warn(`[WalletService] Duplicate credit skipped for ref ${refId}`);
      return wallet;
    }

    await this._walletRepository.updateBalance(targetId, amount);

    const transaction = {
      type: "CREDIT",
      amount: amount,
      description: description,
      referenceId: refId,
      date: new Date(),
      status: "COMPLETED",
    };

    return (await this._walletRepository.addTransaction(targetId, transaction as ITransaction))!;
  }

  async ensureWalletExists(userId: string, role: string): Promise<IWallet> {
    if (userId === "admin") {
      const targetId = await this._resolveUserId("admin");
      return this.ensureWalletExists(targetId, "admin");
    }

    const existing = await this._walletRepository.findByUser(userId);
    if (existing) return existing;
    return await this._walletRepository.createWallet(userId, role);
  }

  async debitWallet(
    userId: string,
    amount: number,
    description: string,
    refId: string,
  ): Promise<IWallet> {
    const targetId = await this._resolveUserId(userId);
    const wallet = await this.ensureWalletExists(targetId, userId === "admin" ? "admin" : "user");

    if (!wallet) {
      throw new AppError("Wallet not found", HttpStatus.NOT_FOUND);
    }

    if (
      wallet.transaction &&
      wallet.transaction.some((t: ITransaction) => t.referenceId === refId && t.type === "DEBIT")
    ) {
      console.warn(`[WalletService] Duplicate debit skipped for ref ${refId}`);
      return wallet;
    }

    await this._walletRepository.updateBalance(targetId, -amount);

    const transaction = {
      type: "DEBIT",
      amount: amount,
      description: description,
      referenceId: refId,
      date: new Date(),
      status: "COMPLETED",
    };

    return (await this._walletRepository.addTransaction(targetId, transaction as ITransaction))!;
  }

  async creditPending(
    userId: string,
    amount: number,
    description: string,
    refId: string,
  ): Promise<IWallet> {
    const targetId = await this._resolveUserId(userId);
    const wallet = await this.ensureWalletExists(targetId, userId === "admin" ? "admin" : "user");

    if (
      wallet.transaction &&
      wallet.transaction.some(
        (t: ITransaction) => t.referenceId === refId && t.status === "PENDING",
      )
    ) {
      console.warn(`[WalletService] Duplicate pending credit skipped for ref ${refId}`);
      return wallet;
    }

    const transaction = {
      type: "CREDIT",
      amount: amount,
      description: description,
      referenceId: refId,
      date: new Date(),
      status: "PENDING",
    };

    return (await this._walletRepository.addTransaction(targetId, transaction as ITransaction))!;
  }

  async releasePending(userId: string, refId: string): Promise<IWallet> {
    const targetId = await this._resolveUserId(userId);
    const wallet = await this.getWallet(targetId);
    if (!wallet) throw new AppError("Wallet not found", HttpStatus.NOT_FOUND);

    const transaction = wallet.transaction.find((t) => t.referenceId === refId);
    if (!transaction) throw new AppError("Transaction not found", HttpStatus.NOT_FOUND);
    if (transaction.status !== "PENDING")
      throw new AppError("Transaction is not pending", HttpStatus.BAD_REQUEST);

    await this._walletRepository.updateBalance(targetId, transaction.amount);
    return (await this._walletRepository.updateTransactionStatus(targetId, refId, "COMPLETED"))!;
  }
}
