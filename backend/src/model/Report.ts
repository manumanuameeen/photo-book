import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
  reporterId: mongoose.Types.ObjectId;
  targetId: string;
  targetType: "photographer" | "rental" | "user" | "package";
  targetName?: string;
  reason: string;
  subReason?: string;
  description: string;
  evidenceUrls?: string[];
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  actionTaken?: "warning" | "block" | "false_report_dismissed" | "none" | "resolved";
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetId: { type: String, required: true },
    targetType: {
      type: String,
      enum: ["photographer", "rental", "user", "package"],
      required: true,
    },
    targetName: { type: String },
    reason: { type: String, required: true },
    subReason: { type: String },
    description: { type: String, required: true },
    evidenceUrls: [{ type: String }],
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
    },
    actionTaken: {
      type: String,
      enum: ["warning", "block", "false_report_dismissed", "none", "resolved"],
      default: "none",
    },
    adminNotes: { type: String },
  },
  {
    timestamps: true,
  },
);

export const Report = mongoose.model<IReport>("Report", ReportSchema);
