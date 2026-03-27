import mongoose, { Schema } from "mongoose";
import { IReportCategory } from "../interfaces/models/IReportCategory";

const ReportCategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    subReasons: [{ type: String }],
  },
  {
    timestamps: true,
  },
);

export const ReportCategory = mongoose.model<IReportCategory>(
  "ReportCategory",
  ReportCategorySchema,
);
