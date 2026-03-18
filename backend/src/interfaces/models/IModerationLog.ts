import mongoose, { Document } from "mongoose";

export interface IModerationLog extends Document {
  targetId: string;
  targetType: "photographer" | "rental" | "user";
  actionTaken: "warning" | "block" | "false_report_dismissed";
  reason: string;
  adminId: mongoose.Types.ObjectId;
  notes?: string;
  suspensionEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
