import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAddress extends Document {
    street_address_1: string;
    street_address_2: string;
    city: string;
    zip_code: string;
    createdAt: Date;
}

const AddressSchema: Schema = new Schema(
    {
        street_address_1: { type: String, required: true },
        street_address_2: { type: String, default: "" },
        city: { type: String, required: true },
        zip_code: { type: String, required: true },
    },
    { timestamps: true }
);

export const AddressModel: Model<IAddress> = mongoose.model<IAddress>("Address", AddressSchema);
