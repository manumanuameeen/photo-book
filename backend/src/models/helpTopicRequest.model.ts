import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHelpTopicRequest extends Document {
  user: mongoose.Types.ObjectId;
  topic: string;
  description: string;
  status: "pending" | "reviewed" | "implemented";
  createdAt: Date;
  updatedAt: Date;
}

const HelpTopicRequestSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "reviewed", "implemented"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export const HelpTopicRequestModel: Model<IHelpTopicRequest> = mongoose.model<IHelpTopicRequest>(
  "HelpTopicRequest",
  HelpTopicRequestSchema,
);
