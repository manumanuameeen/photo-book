import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRentalItem extends Document {
  name: string;
  description: string;
  category: string;
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  pricePerDay: number;
  securityDeposit: number;
  minRentalPeriod: number;
  stock: number;
  quantity: number;
  images: string[];
  maxRentalPeriod?: number;
  ownerId?: mongoose.Types.ObjectId;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "AVAILABLE"
    | "UNAVAILABLE"
    | "MAINTENANCE"
    | "BLOCKED";
  blockedDates: {
    startDate: Date;
    endDate: Date;
    reason?: string;
  }[];
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const RentalItemSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    condition: {
      type: String,
      enum: ["Excellent", "Good", "Fair", "Poor"],
      required: true,
    },
    pricePerDay: { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },
    minRentalPeriod: { type: Number, default: 1 },
    maxRentalPeriod: { type: Number, default: 5 },
    stock: { type: Number, required: true, default: 1 },
    quantity: { type: Number, required: true, default: 1 },
    images: [{ type: String }],
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "AVAILABLE",
        "UNAVAILABLE",
        "MAINTENANCE",
        "BLOCKED",
      ],
      default: "PENDING",
    },
    blockedDates: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        reason: { type: String },
      },
    ],
  },
  { timestamps: true },
);

export const RentalItemModel: Model<IRentalItem> = mongoose.model<IRentalItem>(
  "RentalItem",
  RentalItemSchema,
);
