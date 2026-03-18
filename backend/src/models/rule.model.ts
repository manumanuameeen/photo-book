import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRule extends Document {
  title: string;
  description: string;
  category: "booking" | "rental" | "general";
  type: "reschedule" | "cancel" | "fine" | "info";
  amount?: number;
  icon?: string;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const RuleSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["booking", "rental", "general"],
      required: true,
    },
    type: {
      type: String,
      enum: ["reschedule", "cancel", "fine", "info"],
      default: "info",
    },
    amount: { type: Number },
    icon: { type: String, default: "info" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const RuleModel: Model<IRule> = mongoose.model<IRule>("Rule", RuleSchema);
