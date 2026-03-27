import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { IReviewService } from "../../interfaces/services/IReviewService";
import { AppError } from "../../utils/AppError";
import { Messages } from "../../constants/messages";
import { HttpStatus } from "../../constants/httpStatus";
import { ApiResponse } from "../../utils/response";
import { IReviewController } from "../../interfaces/controllers/IReviewController";
import { UpdateReviewDto } from "../../dto/auth.dto";
import { handleError } from "../../utils/errorHandler";

export class ReviewController implements IReviewController {
  private readonly _reviewService: IReviewService;

  constructor(reviewService: IReviewService) {
    this._reviewService = reviewService;
  }

  addReview = async (req: AuthRequest, res: Response) => {
    try {
      const reviewerId = req.user?.userId;
      const { targetId, type, rating, comment } = req.body;

      if (!reviewerId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      if (!targetId || !type || !rating || !comment) {
        throw new AppError(Messages.ALL_FIELDS_REQUIRED, HttpStatus.BAD_REQUEST);
      }

      const review = await this._reviewService.addReview(
        reviewerId,
        targetId,
        type,
        rating,
        comment,
      );
      ApiResponse.success(res, review, Messages.REVIEW_ADDED, HttpStatus.CREATED);
    } catch (error) {
      handleError(res, error);
    }
  };

  getReviews = async (req: AuthRequest, res: Response) => {
    try {
      const { targetId } = req.params;
      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 5;

      const result = await this._reviewService.getReviews(targetId, page, limit);
      ApiResponse.success(res, result, Messages.REVIEWS_FETCHED);
    } catch (error) {
      handleError(res, error);
    }
  };

  getStats = async (req: AuthRequest, res: Response) => {
    try {
      const { targetId } = req.params;
      const stats = await this._reviewService.getStats(targetId);
      ApiResponse.success(res, stats, Messages.REVIEW_STATS_FETCHED);
    } catch (error) {
      handleError(res, error);
    }
  };

  replyToReview = async (req: AuthRequest, res: Response) => {
    try {
      const ownerId = req.user?.userId;
      const { id: reviewId } = req.params;
      const { comment } = req.body;

      if (!ownerId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      if (!comment) {
        throw new AppError(Messages.COMMENT_REQUIRED, HttpStatus.BAD_REQUEST);
      }

      const review = await this._reviewService.replyToReview(ownerId, reviewId, comment);
      ApiResponse.success(res, review, Messages.REPLY_ADDED);
    } catch (error) {
      handleError(res, error);
    }
  };

  toggleLikeReview = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { id: reviewId } = req.params;

      if (!userId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      const review = await this._reviewService.toggleLikeReview(userId, reviewId);
      ApiResponse.success(res, review, Messages.LIKE_TOGGLED);
    } catch (error) {
      handleError(res, error);
    }
  };

  deleteReview = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { id: reviewId } = req.params;

      if (!userId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      await this._reviewService.deleteReview(userId, reviewId);
      ApiResponse.success(res, null, Messages.REVIEW_DELETED);
    } catch (error) {
      handleError(res, error);
    }
  };

  updateReview = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { id: reviewId } = req.params;

      if (!userId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      const payload = UpdateReviewDto.parse(req.body);

      const updated = await this._reviewService.updateReview(reviewId, userId, payload);
      ApiResponse.success(res, updated, Messages.REVIEW_UPDATED, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  getUserReviews = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string;

      const data = await this._reviewService.getUserReviews(userId, page, limit, search);
      ApiResponse.success(res, data, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };

  getReceivedReviews = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(Messages.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string;

      const data = await this._reviewService.getReceivedReviews(userId, page, limit, search);
      ApiResponse.success(res, data, Messages.SUCCESS, HttpStatus.OK);
    } catch (error) {
      handleError(res, error);
    }
  };
}
