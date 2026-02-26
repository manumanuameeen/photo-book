import { z } from "zod";

export const CreateReportDTOSchema = z.object({
    targetId: z.string(),
    targetType: z.enum(["photographer", "rental", "user", "package"]),
    targetName: z.string().optional(),
    reason: z.string(),
    subReason: z.string().optional(),
    description: z.string(),
    evidenceUrls: z.array(z.string()).optional(),
});
export type CreateReportDTO = z.infer<typeof CreateReportDTOSchema>;

export const ApplyPenaltyDTOSchema = z.object({
    actionTaken: z.enum(["warning", "block", "false_report_dismissed", "resolved"]),
    adminNotes: z.string(),
    suspensionEndDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional(),
});
export type ApplyPenaltyDTO = z.infer<typeof ApplyPenaltyDTOSchema>;

export const CreateReportCategoryDTOSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    subReasons: z.array(z.string()),
});
export type CreateReportCategoryDTO = z.infer<typeof CreateReportCategoryDTOSchema>;

export const UpdateReportCategoryDTOSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    subReasons: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
});
export type UpdateReportCategoryDTO = z.infer<typeof UpdateReportCategoryDTOSchema>;
