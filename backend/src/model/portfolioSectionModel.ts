import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPortfolioSection extends Document {
    photographerId: mongoose.Types.ObjectId;
    title: string;
    coverImage?: string;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
}

const PortfolioSectionSchema: Schema = new Schema(
    {
        photographerId: { type: Schema.Types.ObjectId, ref: "Photographer", required: true },
        title: { type: String, required: true },
        coverImage: { type: String },
        images: [{ type: String }],
    },
    { timestamps: true }
);

// Ensure a photographer can't have duplicate section titles
PortfolioSectionSchema.index({ photographerId: 1, title: 1 }, { unique: true });

export const PortfolioSectionModel: Model<IPortfolioSection> = mongoose.model<IPortfolioSection>("PortfolioSection", PortfolioSectionSchema);
