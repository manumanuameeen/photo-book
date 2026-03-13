import { z } from "zod";

export const AdminDashboardStatsSchema = z.object({
  topMetrics: z.array(
    z.object({
      title: z.string(),
      value: z.string(),
      trend: z.string(),
      trendColor: z.enum(["positive", "negative", "neutral"]),
      icon: z.string(),
      iconBgColor: z.string(),
    }),
  ),
  smallMetrics: z.array(
    z.object({
      title: z.string(),
      value: z.string(),
      trend: z.string(),
      trendColor: z.enum(["positive", "negative", "neutral"]),
      icon: z.string(),
      iconBgColor: z.string(),
      isSmall: z.boolean(),
    }),
  ),
  activities: z.array(
    z.object({
      id: z.string(),
      icon: z.string(),
      title: z.string(),
      detail: z.string(),
      borderColor: z.string(),
      time: z.date(),
    }),
  ),
  revenueTrend: z.array(
    z.object({
      name: z.string(),
      amount: z.number(),
    }),
  ),
  bookingsTrend: z.array(
    z.object({
      name: z.string(),
      count: z.number(),
    }),
  ),
  alerts: z.array(
    z.object({
      type: z.enum(["warning", "error", "info"]),
      title: z.string(),
      detail: z.string(),
    }),
  ),
  categoryDistribution: z.array(
    z.object({
      name: z.string(),
      value: z.number(),
      color: z.string(),
    }),
  ),
  revenueSplit: z.array(
    z.object({
      name: z.string(),
      value: z.number(),
      color: z.string(),
    }),
  ),
  topPhotographers: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().optional(),
      rating: z.number(),
      reviews: z.number(),
      bookings: z.number(),
    }),
  ),
  topRentalOwners: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().optional(),
      revenue: z.number(),
      orders: z.number(),
      items: z.number(),
    }),
  ),
  topRegions: z.array(
    z.object({
      name: z.string(),
      value: z.number(),
    }),
  ),
  pendingReportsCount: z.number().optional(),
});

export type AdminDashboardStatsDto = z.infer<typeof AdminDashboardStatsSchema>;
