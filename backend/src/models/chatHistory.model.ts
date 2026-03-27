import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  structuredData?: Record<string, unknown>;
  timestamp: Date;
}

export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  messages: IChatMessage[];
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema: Schema = new Schema({
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  structuredData: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

const ChatHistorySchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: String, required: true, index: true },
    messages: [ChatMessageSchema],
    lastMessageAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Index for quick retrieval of current user session
ChatHistorySchema.index({ userId: 1, sessionId: 1 });

export const ChatHistoryModel = mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema);
