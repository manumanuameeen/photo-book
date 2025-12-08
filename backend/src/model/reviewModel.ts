import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
    reviewerId: mongoose.Types.ObjectId;
    targetId: mongoose.Types.ObjectId;
    type: string;
    rating: number;
    comment: string;
    createdAt: Date;
}

const ReviewSchema: Schema = new Schema(
    {
        reviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Can review users or photographers
        targetId: { type: Schema.Types.ObjectId, required: true }, // Can be booking or photographer
        type: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
    },
    { timestamps: true }
);

export const ReviewModel: Model<IReview> = mongoose.model<IReview>("Review", ReviewSchema);
