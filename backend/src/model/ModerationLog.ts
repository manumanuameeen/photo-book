import mongoose, { Schema } from "mongoose";
import { IModerationLog } from "../interfaces/models/IModerationLog.ts";

const ModerationLogSchema: Schema = new Schema(
    {
        targetId: { type: String, required: true },
        targetType: {
            type: String,
            enum: ["photographer", "rental", "user"],
            required: true,
        },
        actionTaken: {
            type: String,
            enum: ["warning", "block", "false_report_dismissed"],
            required: true,
        },
        reason: { type: String, required: true },
        adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
        notes: { type: String },
        suspensionEndDate: { type: Date },
    },
    {
        timestamps: true,
    },
);

export const ModerationLog = mongoose.model<IModerationLog>(
    "ModerationLog",
    ModerationLogSchema,
);
