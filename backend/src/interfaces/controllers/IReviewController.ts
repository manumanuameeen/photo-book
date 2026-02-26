import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware.ts";

export interface IReviewController {
  addReview(req: AuthRequest, res: Response): Promise<void>;
  getReviews(req: AuthRequest, res: Response): Promise<void>;
  getStats(req: AuthRequest, res: Response): Promise<void>;
  replyToReview(req: AuthRequest, res: Response): Promise<void>;
  toggleLikeReview(req: AuthRequest, res: Response): Promise<void>;
  deleteReview(req: AuthRequest, res: Response): Promise<void>;
  updateReview(req: AuthRequest, res: Response): Promise<void>;
  getUserReviews(req: AuthRequest, res: Response): Promise<void>;
  getReceivedReviews(req: AuthRequest, res: Response): Promise<void>;
}
