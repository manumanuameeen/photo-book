import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
  senderId?: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  content: string;
  attachment?: {
    url: string;
    type: "image" | "video" | "file" | "audio";
  };
  isRead: boolean;
  type: "SYSTEM" | "DIRECT";
  createdAt: Date;
  replyTo?: mongoose.Types.ObjectId | IMessage;
  isDeleted?: boolean;
  isEdited?: boolean;
}

const MessageSchema: Schema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    attachment: {
      url: { type: String },
      type: { type: String, enum: ["image", "video", "file", "audio"] },
    },
    isRead: { type: Boolean, default: false },
    type: { type: String, enum: ["SYSTEM", "DIRECT"], default: "SYSTEM" },
    replyTo: { type: Schema.Types.ObjectId, ref: "Message" },
    isDeleted: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const MessageModel: Model<IMessage> = mongoose.model<IMessage>("Message", MessageSchema);
