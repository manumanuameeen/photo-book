import { Request, Response } from "express";
import { IAdminReviewService } from "../../interfaces/services/IAdminReviewService";
import { ApiResponse } from "../../utils/response";
import { Messages } from "../../constants/messages";
import { handleError } from "../../utils/errorHandler";
export class AdminReviewController {
  private readonly _adminReviewService: IAdminReviewService;
  constructor(adminReviewService: IAdminReviewService) {
    this._adminReviewService = adminReviewService;
  }
  getAllReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const rating = req.query.rating ? parseInt(req.query.rating as string) : undefined;
      const type = req.query.type as string;
      const result = await this._adminReviewService.getAllReviews(
        page,
        limit,
        search,
        rating,
        type,
      );
      ApiResponse.success(res, result, Messages.SUCCESS);
    } catch (error) {
      handleError(res, error);
    }
  };
  deleteReview = async (req: Request, res: Response): Promise<void> => {
    try {
      await this._adminReviewService.deleteReview(req.params.id);
      ApiResponse.success(res, null, Messages.SUCCESS);
    } catch (error) {
      handleError(res, error);
    }
  };
}
