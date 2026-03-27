import type { IReview } from "../../models/review.model";

export interface IReviewRepository {
  addReview(review: Partial<IReview>): Promise<IReview>;
  getReviewsByTarget(
    targetId: string,
    page: number,
    limit: number,
  ): Promise<{ reviews: IReview[]; total: number }>;
  getReviewStats(targetId: string): Promise<{ average: number; count: number }>;
  hasReviewed(reviewerId: string, targetId: string, type: string): Promise<boolean>;
  addReply(reviewId: string, reply: string): Promise<IReview | null>;
  toggleLike(reviewId: string, userId: string): Promise<IReview | null>;
  getReviewById(reviewId: string): Promise<IReview | null>;
  delete(id: string): Promise<boolean>;
  getReviewsByReviewer(
    reviewerId: string,
    page: number,
    limit: number,
    search?: string,
    targetIds?: string[],
  ): Promise<{ reviews: IReview[]; total: number }>;
  getReceivedReviews(
    targetIds: string[],
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ reviews: IReview[]; total: number }>;
  update(id: string, payload: Partial<IReview>): Promise<IReview | null>;
}
