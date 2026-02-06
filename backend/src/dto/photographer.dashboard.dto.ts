import { z } from "zod";

export const PhotographerDashboardStatsSchema = z.object({
  earnings: z.object({
    total: z.number(),
    monthly: z.number(),
    growth: z.number(),
    pendingPayouts: z.number(),
  }),
  sessions: z.object({
    total: z.number(),
    newRequests: z.number(),
  }),
  reviews: z.object({
    averageRating: z.number(),
    totalReviews: z.number(),
    latest: z.array(
      z.object({
        _id: z.string(),
        clientName: z.string(),
        comment: z.string(),
        rating: z.number(),
        createdAt: z.date(),
      }),
    ),
  }),
  pendingRequests: z.array(
    z.object({
      _id: z.string(),
      clientName: z.string(),
      eventType: z.string(),
      date: z.string(),
      status: z.string(),
    }),
  ),
  upcomingBookings: z.array(
    z.object({
      _id: z.string(),
      clientName: z.string(),
      date: z.string(),
      location: z.string(),
      status: z.string(),
    }),
  ),
  recentMessages: z.array(
    z.object({
      _id: z.string(),
      clientName: z.string(),
      senderRole: z.string().optional(),
      message: z.string(),
      time: z.string(),
      fullDate: z.date().optional(),
    }),
  ),
  revenueTrend: z.array(
    z.object({
      month: z.string(),
      amount: z.number(),
    }),
  ),
  sessionTypes: z.array(
    z.object({
      type: z.string(),
      count: z.number(),
    }),
  ),
});

export type PhotographerDashboardStatsDto = z.infer<typeof PhotographerDashboardStatsSchema>;
