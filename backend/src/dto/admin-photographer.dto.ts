import { X } from "lucide-react";
import { z } from "zod";

export const GetPhotographersQueryDto = z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("10"),
    search: z.string().optional(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "ALL"]),
    isBlocked: z.enum(["true", "false", "all"]).optional(),
})

export const BlockPhotographerDto = z.object({
    reason: z.string().optional(),
});

export const ApprovedApplicationDto = z.object({
    message: z.string().min(10, 'Message must be least 10 charecters')
});

export const RejectedApplicationDto = z.object({
    reason: z.string().min(20, "Reason must be at least 20 charecters"),
});

export type GetPhotographersQueryDtoType = z.infer<typeof GetPhotographersQueryDto>;
export type BlockPhotographerDtoType = z.infer<typeof BlockPhotographerDto>;
export type ApprovedApplicationDtoType = z.infer<typeof ApprovedApplicationDto>;
export type RejectedApplicationDtoType = z.infer<typeof RejectedApplicationDto>;