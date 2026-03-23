import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { IAdminDashboardService } from "../../interfaces/services/IAdminDashboardService";
import { IAdminDashboardController } from "../../interfaces/controllers/IAdminDashboardController";
import { ApiResponse } from "../../utils/response";
import { HttpStatus } from "../../constants/httpStatus";
import { Messages } from "../../constants/messages";

import { AppError } from "../../utils/AppError";
import { handleError } from "../../utils/errorHandler";

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

      if (startDate && typeof startDate === "string") {
        const d = new Date(startDate);
        if (!isNaN(d.getTime())) parsedStartDate = d;
      }

      if (endDate && typeof endDate === "string") {
        const d = new Date(endDate);
        if (!isNaN(d.getTime())) {
          d.setHours(23, 59, 59, 999);
          parsedEndDate = d;
        }
      }

      const stats = await this._dashboardService.getDashboardStats(parsedStartDate, parsedEndDate);
      ApiResponse.success(res, stats, Messages.DASHBOARD_STATS_FETCHED);
    } catch (error: unknown) {
      handleError(res, error);
    }
  };
}
