import { IReview, IEnrichedReview } from "../../model/reviewModel.ts";
export interface IAdminReviewService {
  getAllReviews(
    page: number,
    limit: number,
    search?: string,
    rating?: number,
    type?: string,
  ): Promise<{ reviews: IEnrichedReview[]; total: number }>;
  deleteReview(id: string): Promise<void>;
}
