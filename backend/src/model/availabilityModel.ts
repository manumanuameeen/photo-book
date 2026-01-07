import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAvailabilitySlot {
    startTime: string;
    endTime: string;
    status: "AVAILABLE" | "BOOKED" | "UNAVAILABLE";
}

export interface IAvailability extends Document {
    photographer: mongoose.Types.ObjectId;
    date: Date;
    slots: IAvailabilitySlot[];
    isFullDayAvailable: boolean;
}

const AvailabilitySchema: Schema = new Schema(
    {
        photographer: { type: Schema.Types.ObjectId, ref: "Photographer", required: true },
        date: { type: Date, required: true },
        slots: [
            {
                startTime: { type: String, required: true },
                endTime: { type: String, required: true },
                status: {
                    type: String,
                    enum: ["AVAILABLE", "BOOKED", "UNAVAILABLE"],
                    default: "AVAILABLE",
                },
            },
        ],
        isFullDayAvailable: { type: Boolean, default: false },
    },
    { timestamps: true },
);

AvailabilitySchema.index({ photographer: 1, date: 1 }, { unique: true });

AvailabilitySchema.index({ date: 1 }, { expireAfterSeconds: 86400 });

export const AvailabilityModel: Model<IAvailability> = mongoose.model<IAvailability>("Availability", AvailabilitySchema);