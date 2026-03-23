import { IWallet, ITransaction } from "../../models/wallet.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IWalletRepository extends IBaseRepository<IWallet> {
  createWallet(userId: string, role: string): Promise<IWallet>;
  findByUser(userId: string): Promise<IWallet | null>;
  findByRole(role: string): Promise<IWallet | null>;
  updateBalance(userId: string, amount: number): Promise<IWallet | null>;
  addTransaction(userId: string, transaction: ITransaction): Promise<IWallet | null>;
  updateTransactionStatus(userId: string, refId: string, status: string): Promise<IWallet | null>;
  getTransactions(
    userId: string,
    page?: number,
    limit?: number,
    type?: string,
    status?: string,
  ): Promise<{ transactions: ITransaction[]; total: number }>;
}
