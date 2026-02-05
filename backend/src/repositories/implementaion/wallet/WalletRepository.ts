import mongoose from "mongoose";
import { WalletModel, IWallet, ITransaction } from "../../../model/walletModel.ts";
import { BaseRepository } from "../../base/BaseRepository.ts";
import { IWalletRepository } from "../../../interfaces/repositories/IWalletRepository.ts";

export class WalletRepository extends BaseRepository<IWallet> implements IWalletRepository {
  constructor() {
    super(WalletModel);
  }

  async createWallet(userId: string, role: string): Promise<IWallet> {
    return await this._model.create({ userId, role, balance: 0, transaction: [] });
  }

  async findByUser(userId: string): Promise<IWallet | null> {
    return await this._model.findOne({ userId });
  }

  async findByRole(role: string): Promise<IWallet | null> {
    return await this._model.findOne({ role });
  }

  async updateBalance(userId: string, amount: number): Promise<IWallet | null> {
    const updated = await this._model.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true },
    );
    console.log(
      `[WalletRepo] updateBalance for ${userId} by ${amount}: New Balance=${updated?.balance}`,
    );
    return updated;
  }

  async addTransaction(userId: string, transaction: ITransaction): Promise<IWallet | null> {
    return await this._model.findOneAndUpdate(
      { userId },
      { $push: { transaction: transaction } },
      { new: true },
    );
  }

  async updateTransactionStatus(
    userId: string,
    refId: string,
    status: string,
  ): Promise<IWallet | null> {
    return await this._model.findOneAndUpdate(
      { userId, "transaction.referenceId": refId },
      { $set: { "transaction.$.status": status } },
      { new: true },
    );
  }

  async getTransactions(
    userId: string,
    page: number = 1,
    limit: number = 10,
    type?: string,
    status?: string,
  ): Promise<{ transactions: ITransaction[]; total: number }> {
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$transaction" },
      { $sort: { "transaction.date": -1 } },
    ];

    if (type && type !== "ALL") {
      pipeline.push({ $match: { "transaction.type": type } });
    }

    if (status && status !== "ALL") {
      pipeline.push({ $match: { "transaction.status": status } });
    }

    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }, { $replaceRoot: { newRoot: "$transaction" } }],
      },
    });

    const result = await this._model.aggregate(pipeline);

    if (result[0]?.metadata?.length > 0) {
      return {
        transactions: result[0].data,
        total: result[0].metadata[0].total,
      };
    }

    return { transactions: [], total: 0 };
  }
}
