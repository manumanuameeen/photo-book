import type { AdminDashboardStatsDto } from "../../dto/admin.dashboard.dto.ts";

export interface IAdminDashboardService {
  getDashboardStats(startDate?: Date, endDate?: Date): Promise<AdminDashboardStatsDto>;
}
