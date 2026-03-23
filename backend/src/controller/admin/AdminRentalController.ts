import { Request, Response } from "express";
import { IAdminRentalService } from "../../interfaces/services/rental/IAdminRentalService";
import { ApiResponse } from "../../utils/response";
import { Messages } from "../../constants/messages";

import { IAdminRentalController } from "../../interfaces/controllers/IAdminRentalController";
import { handleError } from "../../utils/errorHandler";

export class AdminRentalController implements IAdminRentalController {
  constructor(private readonly _adminRentalService: IAdminRentalService) {}

  getAdminItems = async (req: Request, res: Response) => {
    try {
      const { status, page, limit, search } = req.query;
      const pageNum = page ? Number.parseInt(page as string) : 1;
      const limitNum = limit ? Number.parseInt(limit as string) : 10;
      const result = await this._adminRentalService.getAdminRentalItems(
        status as string,
        pageNum,
        limitNum,
        search as string,
      );
      ApiResponse.success(res, result, Messages.ADMIN_ITEMS_FETCHED);
    } catch (error) {
      handleError(res, error);
    }
  };

  getAllOrders = async (req: Request, res: Response) => {
    try {
      const { page, limit, search, status } = req.query;
      const pageNum = page ? Number.parseInt(page as string) : 1;
      const limitNum = limit ? Number.parseInt(limit as string) : 10;
      const result = await this._adminRentalService.getAllRentalOrders(
        pageNum,
        limitNum,
        search as string,
        status as string,
      );
      ApiResponse.success(res, result, Messages.ALL_RENTAL_ORDERS_FETCHED);
    } catch (error) {
      handleError(res, error);
    }
  };
}
