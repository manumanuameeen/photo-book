import { IAdminReviewService } from "../../interfaces/services/IAdminReviewService.ts";
import { ReviewModel, IReview, IEnrichedReview } from "../../model/reviewModel.ts";
import { PhotographerModel } from "../../model/photographerModel.ts";
import { RentalItemModel } from "../../model/rentalItemModel.ts";
import { BookingPackageModel } from "../../model/bookingPackageModel.ts";
import { AppError } from "../../utils/AppError.ts";
import { HttpStatus } from "../../constants/httpStatus.ts";
import mongoose from "mongoose";
export class AdminReviewService implements IAdminReviewService {
  async getAllReviews(
    page: number,
    limit: number,
    search?: string,
    rating?: number,
    type?: string,
  ): Promise<{ reviews: IEnrichedReview[]; total: number }> {
    const skip = (page - 1) * limit;
    const filter: mongoose.FilterQuery<IReview> = {};
    if (rating) filter.rating = rating;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [{ comment: { $regex: search, $options: "i" } }];
    }
    const reviews = await ReviewModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("reviewerId", "name email");
    const total = await ReviewModel.countDocuments(filter);
    const enrichedReviews = await this._enrichReviews(reviews);
    return { reviews: enrichedReviews, total };
  }
  async deleteReview(id: string): Promise<void> {
    const review = await ReviewModel.findByIdAndDelete(id);
    if (!review) {
      throw new AppError("Review not found", HttpStatus.NOT_FOUND);
    }
  }
  private async _enrichReviews(reviews: IReview[]): Promise<IEnrichedReview[]> {
    return await Promise.all(
      reviews.map(async (review) => {
        const reviewObj = review.toObject ? review.toObject() : review;
        let targetName = "Unknown Target";
        let targetImage: string | null = null;
        try {
          if (review.type === "photographer") {
            const doc = await PhotographerModel.findById(review.targetId).populate(
              "userId",
              "name",
            );
            if (doc) {
              targetName =
                (doc.userId as unknown as { name: string })?.name || "Photographer Profile";
              targetImage = doc.portfolio?.portfolioImages?.[0] || null;
            }
          } else if (review.type === "package") {
            const doc = await BookingPackageModel.findById(review.targetId);
            if (doc) {
              targetName = doc.name;
            }
          } else if (review.type === "rental") {
            const doc = await RentalItemModel.findById(review.targetId);
            if (doc) {
              targetName = doc.name;
              targetImage = doc.images && doc.images.length > 0 ? doc.images[0] : null;
            }
          }
        } catch (e) {
          console.error(`Error fetching target for review ${review._id}:`, e);
        }
        return {
          ...reviewObj,
          reviewerName: (reviewObj.reviewerId as unknown as { name: string })?.name || "Anonymous",
          targetName,
          targetImage,
        } as IEnrichedReview;
      }),
    );
  }
}
