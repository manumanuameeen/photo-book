import mongoose, { Schema, Document, Model } from "mongoose";

export enum PaymentType {
    DEPOSIT = "DEPOSIT",
    FULL_PAYMENT = "FULL_PAYMENT",
    REFUND = "REFUND",
}

export interface IPayment extends Document {
    orderId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    amount: number;
    platformFee: number;
    deposite: number;
    totalAmount: number;
    paymentType: PaymentType;
    method: string;
    status: string;
    paymentDate: Date;
    createdAt: Date;
}

const PaymentSchema: Schema = new Schema(
    {
        orderId: { type: Schema.Types.ObjectId, required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        amount: { type: Number, required: true },
        platformFee: { type: Number, required: true },
        deposite: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        paymentType: { type: String, enum: Object.values(PaymentType), required: true },
        method: { type: String, required: true },
        status: { type: String, required: true },
        paymentDate: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const PaymentModel: Model<IPayment> = mongoose.model<IPayment>("Payment", PaymentSchema);
