import type { IReview, IEnrichedReview } from "../../models/review.model";

export interface IReviewService {
  addReview(
    reviewerId: string,
    targetId: string,
    type: string,
    rating: number,
    comment: string,
  ): Promise<IReview>;
  getReviews(
    targetId: string,
    page: number,
    limit: number,
  ): Promise<{ reviews: IReview[]; total: number }>;
  getStats(targetId: string): Promise<{ average: number; count: number }>;
  replyToReview(ownerId: string, reviewId: string, comment: string): Promise<IReview>;
  toggleLikeReview(userId: string, reviewId: string): Promise<IReview>;
  deleteReview(userId: string, reviewId: string): Promise<void>;
  getUserReviews(
    userId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ reviews: IEnrichedReview[]; total: number }>;
  getReceivedReviews(
    userId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ reviews: IEnrichedReview[]; total: number }>;
  updateReview(id: string, userId: string, payload: Partial<IReview>): Promise<IReview>;
}
