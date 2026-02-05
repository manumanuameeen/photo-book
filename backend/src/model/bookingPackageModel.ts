import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBookingPackage extends Document {
  photographer: mongoose.Types.ObjectId;
  name: string;
  description: string;
  coverImage: string;
  price: number;
  features: string[];
  deliveryTime: string;
  baseprice: number;
  editedPhoto: number;
  isActive: boolean;
  categoryId: mongoose.Types.ObjectId;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "DELETED";
  likes: mongoose.Types.ObjectId[];
  rejectionReason?: string;
  createdAt: Date;
}

const BookingPackageSchema: Schema = new Schema(
  {
    photographer: { type: Schema.Types.ObjectId, ref: "Photographer", required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    coverImage: { type: String },
    price: { type: Number },
    baseprice: { type: Number, required: true },
    editedPhoto: { type: Number, required: true },
    features: [{ type: String }],
    deliveryTime: { type: String },
    isActive: { type: Boolean, default: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "ACTIVE", "DELETED"],
      default: "APPROVED",
    },
    rejectionReason: { type: String },
  },
  { timestamps: true },
);

export const BookingPackageModel: Model<IBookingPackage> = mongoose.model<IBookingPackage>(
  "BookingPackage",
  BookingPackageSchema,
);
