import mongoose, { Schema, Document, Model } from "mongoose";

export enum CategoryType {
    WEDDING = "WEDDING",
    PORTRAIT = "PORTRAIT",
    EVENT = "EVENT",
    OTHER = "OTHER",
}

export interface ICategory extends Document {
    name: string;
    type: CategoryType;
    description: string;
    isBlocked: boolean;
    createdAt: Date;
}

const CategorySchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        type: { type: String, enum: Object.values(CategoryType), required: true },
        description: { type: String, required: true },
        isBlocked: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const CategoryModel: Model<ICategory> = mongoose.model<ICategory>("Category", CategorySchema);
