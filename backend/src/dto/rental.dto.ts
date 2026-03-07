import { z } from "zod";

export const CreateRentalItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  pricePerDay: z.number().positive(),
  securityDeposit: z.number().nonnegative(),
  minRentalPeriod: z.number().int().positive(),
  location: z.string().min(1),
  features: z.array(z.string()),
  images: z.array(z.string()).optional(),
  ownerId: z.string().optional(),
});

export const UpdateRentalItemSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  pricePerDay: z.number().positive().optional(),
  securityDeposit: z.number().nonnegative().optional(),
  minRentalPeriod: z.number().int().positive().optional(),
  location: z.string().optional(),
  features: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  existingImages: z.union([z.array(z.string()), z.string()]).optional(),
});

export const RentItemSchema = z.object({
  itemIds: z.union([z.string(), z.array(z.string())]),
  startDate: z.union([z.string(), z.date()]),
  endDate: z.union([z.string(), z.date()]),
  paymentIntentId: z.string().optional(),
  paymentMethod: z.enum(["ONLINE", "CASH"]),
});

export const BlockDatesSchema = z.object({
  startDate: z.union([z.string(), z.date()]),
  endDate: z.union([z.string(), z.date()]),
  reason: z.string().optional(),
});

export type CreateRentalItemDTO = z.infer<typeof CreateRentalItemSchema>;
export type UpdateRentalItemDTO = z.infer<typeof UpdateRentalItemSchema>;
export type RentItemDTO = z.infer<typeof RentItemSchema>;
export type BlockDatesDTO = z.infer<typeof BlockDatesSchema>;
