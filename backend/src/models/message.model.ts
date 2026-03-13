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
  reportId?: mongoose.Types.ObjectId;
  isDeleted?: boolean;
  isEdited?: boolean;
  deletedFor?: mongoose.Types.ObjectId[];
  reactions?: {
    emoji: string;
    userId: mongoose.Types.ObjectId;
  }[];
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
    reportId: { type: Schema.Types.ObjectId, ref: "Report" },
    isDeleted: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    deletedFor: { type: [{ type: Schema.Types.ObjectId, ref: "User" }], default: [] },
    reactions: {
      type: [
        {
          emoji: { type: String, required: true },
          userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export const MessageModel: Model<IMessage> = mongoose.model<IMessage>("Message", MessageSchema);
