import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPortfolioImage {
  url: string;
  caption: string;
  tags: string[];
  embedding: number[];
}

export interface IPortfolioSection extends Document {
  photographerId: mongoose.Types.ObjectId;
  title: string;
  coverImage?: string;
  images: IPortfolioImage[];
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioSectionSchema: Schema = new Schema(
  {
    photographerId: { type: Schema.Types.ObjectId, ref: "Photographer", required: true },
    title: { type: String, required: true },
    coverImage: { type: String },
    images: [{
      url: { type: String, required: true },
      caption: { type: String, default: "" },
      tags: { type: [String], default: [] },
      embedding: { type: [Number], default: [] },
    }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

PortfolioSectionSchema.index({ photographerId: 1, title: 1 }, { unique: true });

export const PortfolioSectionModel: Model<IPortfolioSection> = mongoose.model<IPortfolioSection>(
  "PortfolioSection",
  PortfolioSectionSchema,
);
