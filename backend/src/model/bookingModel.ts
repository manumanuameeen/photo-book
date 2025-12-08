import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking extends Document {
    userId: mongoose.Types.ObjectId;
    packageDetails: Record<string, any>;
    eventDate: Date;
    startTime: Date;
    depositeRequired: number;
    totalAmount: number;
    location: string;
    eventType: string;
    status: string;
    paymentId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const BookingSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        packageDetails: { type: Schema.Types.Mixed, required: true },
        eventDate: { type: Date, required: true },
        startTime: { type: Date, required: true },
        depositeRequired: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        location: { type: String, required: true },
        eventType: { type: String, required: true },
        status: { type: String, required: true },
        paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    },
    { timestamps: true }
);

export const BookingModel: Model<IBooking> = mongoose.model<IBooking>("Booking", BookingSchema);
