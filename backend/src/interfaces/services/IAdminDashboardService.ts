import type { AdminDashboardStatsDto } from "../../dto/admin.dashboard.dto";

export interface IAdminDashboardService {
  getDashboardStats(startDate?: Date, endDate?: Date): Promise<AdminDashboardStatsDto>;
}
