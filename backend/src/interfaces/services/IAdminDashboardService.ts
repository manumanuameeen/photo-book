import type { AdminDashboardStatsDto } from "../../dto/adminDashboard.dto";

export interface IAdminDashboardService {
  getDashboardStats(startDate?: Date, endDate?: Date): Promise<AdminDashboardStatsDto>;
}
