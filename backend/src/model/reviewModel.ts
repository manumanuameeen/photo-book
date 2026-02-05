import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  reviewerId: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId;
  type: string;
  rating: number;
  comment: string;
  ownerReply?: {
    comment: string;
    createdAt: Date;
  };
  likes: mongoose.Types.ObjectId[];
  isVerified: boolean;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    reviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    type: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    ownerReply: {
      comment: { type: String },
      createdAt: { type: Date },
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

ReviewSchema.index({ reviewerId: 1, targetId: 1, type: 1 }, { unique: true });

export const ReviewModel: Model<IReview> = mongoose.model<IReview>("Review", ReviewSchema);
