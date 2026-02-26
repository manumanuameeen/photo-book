import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRentalPopulatedItem {
  _id: mongoose.Types.ObjectId;
  name: string;
  ownerId: mongoose.Types.ObjectId;
  pricePerDay: number;
}

export interface IRentalOrderPopulated extends Document {
  renterId: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  };
  items: IRentalPopulatedItem[];
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  depositeRequired?: number;
  status: string;
  amountPaid: number;
  createdAt: Date;
  _id: mongoose.Types.ObjectId;
}

export const RentalStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  WAITING_FOR_DEPOSIT: "WAITING_FOR_DEPOSIT",
  CONFIRMED: "CONFIRMED",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REJECTED: "REJECTED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  RETURNED: "RETURNED",
} as const;
export type RentalStatus = (typeof RentalStatus)[keyof typeof RentalStatus];

export interface IRentalOrder extends Document {
  _id: mongoose.Types.ObjectId;
  renterId: mongoose.Types.ObjectId;
  items: mongoose.Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  taxAmount: number;
  totalAmount: number;
  depositeRequired?: number;
  status: RentalStatus;
  paymentId?: string;
  idProof: string;
  paymentMethod: "ONLINE" | "CASH";
  amountPaid: number;
  finalPaymentId?: string;
  isOverdue: boolean;
  fundsReleased: boolean;
  rescheduleRequest?: {
    requestedStartDate: Date;
    requestedEndDate: Date;
    reason: string;
    status: "pending" | "rejected" | "expired" | "approved";
    createdAt: Date;
  };
  cancellationReason?: string;
  cancelledBy?: string;
  cancellationDate?: Date;
  refundAmount?: number;
  penaltyAmount?: number;
  platformFeeRetained?: boolean;
  isEmergency?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RentalOrderSchema: Schema = new Schema(
  {
    renterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [{ type: Schema.Types.ObjectId, ref: "RentalItem", required: true }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    depositeRequired: { type: Number },
    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "WAITING_FOR_DEPOSIT",
        "CONFIRMED",
        "ONGOING",
        "COMPLETED",
        "CANCELLED",
        "REJECTED",
        "SHIPPED",
        "DELIVERED",
        "RETURNED",
      ],
      default: "PENDING",
    },
    paymentId: { type: String },
    idProof: { type: String, required: false },
    paymentMethod: { type: String, enum: ["ONLINE", "CASH"], default: "ONLINE" },
    amountPaid: { type: Number, default: 0 },
    finalPaymentId: { type: String },
    isOverdue: { type: Boolean, default: false },
    fundsReleased: { type: Boolean, default: false },
    rescheduleRequest: {
      requestedStartDate: { type: Date },
      requestedEndDate: { type: Date },
      reason: { type: String },
      status: {
        type: String,
        enum: ["pending", "rejected", "expired", "approved"],
      },
      createdAt: { type: Date },
    },
    cancellationReason: { type: String },
    cancelledBy: { type: String },
    cancellationDate: { type: Date },
    refundAmount: { type: Number },
    penaltyAmount: { type: Number },
    platformFeeRetained: { type: Boolean },
    isEmergency: { type: Boolean },
  },
  { timestamps: true },
);

export const RentalOrderModel: Model<IRentalOrder> = mongoose.model<IRentalOrder>(
  "RentalOrder",
  RentalOrderSchema,
);
