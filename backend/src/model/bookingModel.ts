import mongoose, { Schema, Document, Model } from "mongoose";

export const BookingStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  WAITING_FOR_DEPOSIT: "waiting_for_deposit",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  WORK_STARTED: "work_started",
  WORK_ENDED_PENDING: "work_ended_pending",
  WORK_ENDED: "work_ended",
  WORK_DELIVERED: "work_delivered",
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const PaymentStatus = {
  PENDING: "pending",
  DEPOSIT_PAID: "deposit_paid",
  FULL_PAID: "full_paid",
  REFUNDED: "refunded",
  PARTIAL_REFUNDED: "partial_refunded",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  photographerId: mongoose.Types.ObjectId;
  packageId: mongoose.Types.ObjectId;
  packageDetails: Record<string, any>;
  eventDate: Date;
  startTime: string;
  depositeRequired: number;
  totalAmount: number;
  location: string;
  locationCoordinates?: {
    lat: number;
    lng: number;
  };
  eventType: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  contactDetails: {
    name: string;
    email: string;
    phone: string;
  };
  paymentId?: mongoose.Types.ObjectId;
  transactionId?: string;
  balanceTransactionId?: string;
  paymentDeadline?: Date;
  photographerMessage?: string;
  workStartedAt?: Date;
  workEndedAt?: Date;
  adminFee?: number;
  netPayout?: number;
  fundsReleased: boolean;
  createdAt: Date;
  rescheduleRequest?: {
    requestedDate: Date;
    requestedStartTime: string;
    reason: string;
    status: "pending" | "rejected" | "expired" | "accepted";
    createdAt: Date;
  };
  cancellationReason?: string;
  cancelledBy?: string;
  cancellationDate?: Date;
  refundAmount?: number;
  penaltyAmount?: number;
  platformFeeRetained?: boolean;
  isEmergency?: boolean;
  deliveryWorkLink?: string;
}

const BookingSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    photographerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    packageId: { type: Schema.Types.ObjectId, ref: "BookingPackage", required: true },
    packageDetails: { type: Schema.Types.Mixed, required: true },
    eventDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    depositeRequired: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    location: { type: String, required: true },
    locationCoordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    eventType: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "waiting_for_deposit",
        "work_started",
        "work_ended_pending",
        "work_ended",
        "work_delivered",
        "rejected",
        "cancelled",
        "completed",
      ],
      default: "pending",
    },
    paymentDeadline: { type: Date },
    paymentStatus: {
      type: String,
      enum: ["pending", "deposit_paid", "full_paid", "refunded"],
      default: "pending",
    },
    workStartedAt: { type: Date },
    workEndedAt: { type: Date },
    adminFee: { type: Number },
    netPayout: { type: Number },
    fundsReleased: { type: Boolean, default: false },
    contactDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    transactionId: { type: String },
    balanceTransactionId: { type: String },
    rescheduleRequest: {
      requestedDate: { type: Date },
      requestedStartTime: { type: String },
      reason: { type: String },
      status: {
        type: String,
        enum: ["pending", "rejected", "expired", "accepted"],
        default: "pending",
      },
      createdAt: { type: Date, default: Date.now },
    },
    cancellationReason: { type: String },
    cancelledBy: { type: String },
    cancellationDate: { type: Date },
    refundAmount: { type: Number },
    penaltyAmount: { type: Number },
    platformFeeRetained: { type: Boolean },
    isEmergency: { type: Boolean },
    deliveryWorkLink: { type: String },
  },
  { timestamps: true },
);

export const BookingModel: Model<IBooking> = mongoose.model<IBooking>("Booking", BookingSchema);