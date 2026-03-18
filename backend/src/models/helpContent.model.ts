import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHelpStep {
  title: string;
  description: string;
  order: number;
}

export interface IHelpContent extends Document {
  title: string;
  description: string;
  category: string;
  icon: string;
  order: number;
  steps: IHelpStep[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HelpStepSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, required: true },
});

const HelpContentSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
    },
    icon: { type: String, required: true },
    order: { type: Number, default: 0 },
    steps: { type: [HelpStepSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const HelpContentModel: Model<IHelpContent> = mongoose.model<IHelpContent>(
  "HelpContent",
  HelpContentSchema,
);
