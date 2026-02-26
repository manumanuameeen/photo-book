import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware.ts";
import { IAdminDashboardService } from "../../interfaces/services/IAdminDashboardService.ts";
import { IAdminDashboardController } from "../../interfaces/controllers/IAdminDashboardController.ts";
import { ApiResponse } from "../../utils/response.ts";
import { HttpStatus } from "../../constants/httpStatus.ts";
import { Messages } from "../../constants/messages.ts";

export class AdminDashboardController implements IAdminDashboardController {
  private readonly _dashboardService: IAdminDashboardService;

  constructor(dashboardService: IAdminDashboardService) {
    this._dashboardService = dashboardService;
  }

  getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      let parsedStartDate: Date | undefined;
      let parsedEndDate: Date | undefined;

      if (startDate && typeof startDate === 'string') {
        const d = new Date(startDate);
        if (!isNaN(d.getTime())) parsedStartDate = d;
      }

      if (endDate && typeof endDate === 'string') {
        const d = new Date(endDate);
        if (!isNaN(d.getTime())) {
          // Set to end of day to include the entire end date
          d.setHours(23, 59, 59, 999);
          parsedEndDate = d;
        }
      }

      const stats = await this._dashboardService.getDashboardStats(parsedStartDate, parsedEndDate);
      ApiResponse.success(res, stats, Messages.DASHBOARD_STATS_FETCHED);
    } catch (error: unknown) {
      console.error("Admin Dashboard Error:", error);
      ApiResponse.error(res, Messages.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  };
}
