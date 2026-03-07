import { z } from "zod";

export const CreateBookingSchema = z.object({
  photographerId: z.string(),
  packageId: z.string(),
  packageName: z.string(),
  packagePrice: z.number(),
  packageFeatures: z.array(z.string()),
  date: z.union([z.string(), z.date()]),
  startTime: z.string(),
  location: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  eventType: z.string(),
  contactName: z.string(),
  email: z.string().email(),
  phone: z.string(),
});

export const BookingRescheduleRequestSchema = z.object({
  newDate: z.union([z.date(), z.string()]),
  newStartTime: z.string(),
  reason: z.string(),
});

export const BookingRescheduleResponseSchema = z.object({
  decision: z.enum(["accepted", "rejected"]),
});

export const SearchBookingsQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
});

export type CreateBookingDTO = z.infer<typeof CreateBookingSchema>;
export type BookingRescheduleRequestDTO = z.infer<typeof BookingRescheduleRequestSchema>;
export type BookingRescheduleResponseDTO = z.infer<typeof BookingRescheduleResponseSchema>;
export type SearchBookingsQueryDTO = z.infer<typeof SearchBookingsQuerySchema>;
