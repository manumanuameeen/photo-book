import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction {
    type: string;
    amount: number;
    description: string;
    referenceId: string;
    date: Date;
    status: string;
}

export interface IWallet extends Document {
    userId: mongoose.Types.ObjectId;
    role: string;
    balance: number;
    transaction: ITransaction[];
    lastUpdated: Date;
}

const TransactionSchema: Schema = new Schema({
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    referenceId: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, required: true },
});

const WalletSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, required: true },
        balance: { type: Number, default: 0 },
        transaction: [TransactionSchema],
        lastUpdated: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const WalletModel: Model<IWallet> = mongoose.model<IWallet>("Wallet", WalletSchema);
