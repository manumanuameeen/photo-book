import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
    senderId?: mongoose.Types.ObjectId; // Optional for system messages
    receiverId: mongoose.Types.ObjectId;
    content: string;
    isRead: boolean;
    type: 'SYSTEM' | 'DIRECT';
    createdAt: Date;
}

const MessageSchema: Schema = new Schema(
    {
        senderId: { type: Schema.Types.ObjectId, ref: "User" },
        receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        type: { type: String, enum: ['SYSTEM', 'DIRECT'], default: 'SYSTEM' }
    },
    { timestamps: true }
);

export const MessageModel: Model<IMessage> = mongoose.model<IMessage>("Message", MessageSchema);
