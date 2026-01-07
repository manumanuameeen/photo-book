import mongoose, { Schema, Document, Model } from "mongoose";

export const CategoryType = {
    WEDDING: 'Wedding',
    PORTRAIT: 'Portrait',
    EVENT: 'Event',
    LIFESTYLE: 'Lifestyle',
    OTHER: 'Other'
} as const;

export type CategoryType = typeof CategoryType[keyof typeof CategoryType];

export interface ICategory extends Document {
    name: string;
    type: string;
    description: string;
    explanation?: string;
    suggestionStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
    isBlocked: boolean;
    isActive: boolean;
    isSuggested: boolean;
    requestedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
}

const CategorySchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        type: { type: String, required: true },
        description: { type: String, required: true },
        explanation: { type: String },
        suggestionStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'APPROVED' },
        rejectionReason: { type: String },
        isBlocked: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        isSuggested: { type: Boolean, default: false },
        requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

export const CategoryModel: Model<ICategory> = mongoose.model<ICategory>("Category", CategorySchema);
