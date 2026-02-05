import { z } from "zod";
import { CategoryType } from "../model/categoryModel.ts";

export const CreateCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  type: z.nativeEnum(CategoryType),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
});

export const UpdateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters")
    .optional(),
  type: z.nativeEnum(CategoryType).optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters")
    .optional(),
  isBlocked: z.boolean().optional(),
});

export const SuggestCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  type: z.nativeEnum(CategoryType),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  explanation: z
    .string()
    .min(10, "Please provide a reason why this category is needed")
    .max(1000, "Explanation too long"),
});

export const RejectCategorySchema = z.object({
  reason: z.string().min(5, "Rejection reason is required").max(500, "Reason too long"),
});

export const GetCategoriesQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(10),
  search: z.string().optional(),
  isBlocked: z.enum(["true", "false", "all"]).optional().default("all"),
  isActive: z.enum(["true", "false", "all"]).optional().default("all"),
  isSuggested: z.enum(["true", "false"]).optional(),
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
export type SuggestCategoryDto = z.infer<typeof SuggestCategorySchema>;
export type GetCategoriesQueryDtoType = z.infer<typeof GetCategoriesQueryDto>;
