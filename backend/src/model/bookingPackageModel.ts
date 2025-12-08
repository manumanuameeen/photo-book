import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBookingPackage extends Document {
    photographer: mongoose.Types.ObjectId;
    name: string;
    description: string;
    editedPhoto: number;
    baseprice: number;
    isActive: boolean;
    categoryId: mongoose.Types.ObjectId;
    status: string;
    createdAt: Date;
}

const BookingPackageSchema: Schema = new Schema(
    {
        photographer: { type: Schema.Types.ObjectId, ref: "Photographer", required: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        editedPhoto: { type: Number, required: true },
        baseprice: { type: Number, required: true },
        isActive: { type: Boolean, default: true },
        categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
        status: { type: String, required: true },
    },
    { timestamps: true }
);

export const BookingPackageModel: Model<IBookingPackage> = mongoose.model<IBookingPackage>("BookingPackage", BookingPackageSchema);
