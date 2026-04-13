import mongoose from "mongoose";
import { HttpStatus } from "../../constants/httpStatus";
import { IReviewRepository } from "../../interfaces/repositories/IReviewRepository";
import { IReviewService } from "../../interfaces/services/IReviewService";
import type { IReview, IEnrichedReview } from "../../models/review.model";
import { AppError } from "../../utils/AppError";
import { RentalItemModel } from "../../models/rentalItem.model";
import { BookingPackageModel } from "../../models/bookingPackage.model";
import { BookingModel, BookingStatus } from "../../models/booking.model";
import { RentalOrderModel, RentalStatus } from "../../models/rentalOrder.model";
import { PhotographerModel } from "../../models/photographer.model";

export class ReviewService implements IReviewService {
  private readonly _reviewRepository: IReviewRepository;

  constructor(reviewRepository: IReviewRepository) {
    this._reviewRepository = reviewRepository;
  }

  async addReview(
    reviewerId: string,
    targetId: string,
    type: string,
    rating: number,
    comment: string,
  ): Promise<IReview> {
    const isVerified = await this._checkVerification(reviewerId, targetId, type);

    await this._validateOwnership(reviewerId, targetId, type);

    return await this._reviewRepository.addReview({
      reviewerId: new mongoose.Types.ObjectId(reviewerId),
      targetId: new mongoose.Types.ObjectId(targetId),
      type,
      rating,
      comment,
      isVerified,
    } as Partial<IReview>);
  }

  async getReviews(
    targetId: string,
    page: number,
    limit: number,
  ): Promise<{ reviews: IReview[]; total: number }> {
    return await this._reviewRepository.getReviewsByTarget(targetId, page, limit);
  }

  async getStats(targetId: string): Promise<{ average: number; count: number }> {
    return await this._reviewRepository.getReviewStats(targetId);
  }

  async replyToReview(ownerId: string, reviewId: string, comment: string): Promise<IReview> {
    const review = await this._reviewRepository.addReply(reviewId, comment);
    if (!review) {
      throw new AppError("Review not found.", HttpStatus.NOT_FOUND);
    }
    return review;
  }

  async toggleLikeReview(userId: string, reviewId: string): Promise<IReview> {
    const review = await this._reviewRepository.toggleLike(reviewId, userId);
    if (!review) {
      throw new AppError("Review not found.", HttpStatus.NOT_FOUND);
    }
    return review;
  }

  async deleteReview(userId: string, reviewId: string): Promise<void> {
    const review = await this._reviewRepository.getReviewById(reviewId);
    if (!review) {
      throw new AppError("Review not found.", HttpStatus.NOT_FOUND);
    }

    if (review.reviewerId.toString() !== userId) {
      throw new AppError("You are not authorized to delete this review.", HttpStatus.FORBIDDEN);
    }

    await this._reviewRepository.delete(reviewId);
  }

  async updateReview(id: string, userId: string, payload: Partial<IReview>): Promise<IReview> {
    const review = await this._reviewRepository.getReviewById(id);
    if (!review) {
      throw new AppError("Review not found.", HttpStatus.NOT_FOUND);
    }

    if (review.reviewerId.toString() !== userId) {
      throw new AppError("You are not authorized to edit this review.", HttpStatus.FORBIDDEN);
    }

    if (payload.comment !== undefined && (!payload.comment || payload.comment.trim() === "")) {
      throw new AppError("Comment cannot be empty", HttpStatus.BAD_REQUEST);
    }
    if (payload.rating !== undefined && (payload.rating < 1 || payload.rating > 5)) {
      throw new AppError("Rating must be between 1 and 5", HttpStatus.BAD_REQUEST);
    }

    const updateData: Partial<IReview> = { edited: true };
    if (payload.comment !== undefined) updateData.comment = payload.comment;
    if (payload.rating !== undefined) updateData.rating = payload.rating;

    const updated = await this._reviewRepository.update(id, updateData);
    if (!updated) {
      throw new AppError("Review not found.", HttpStatus.NOT_FOUND);
    }

    return updated;
  }

  async getUserReviews(
    userId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ reviews: IEnrichedReview[]; total: number }> {
    let targetIdsForSearch: string[] | undefined = undefined;

    if (search) {
      targetIdsForSearch = [];
      const [photographers, packages, rentals] = await Promise.all([
        PhotographerModel.find({
          "personalInfo.name": { $regex: search, $options: "i" },
        }).select("_id"),
        BookingPackageModel.find({ name: { $regex: search, $options: "i" } }).select("_id"),
        RentalItemModel.find({ name: { $regex: search, $options: "i" } }).select("_id"),
      ]);

      photographers.forEach((p: { _id: unknown }) => targetIdsForSearch?.push(String(p._id)));
      packages.forEach((pkg: { _id: unknown }) => targetIdsForSearch?.push(String(pkg._id)));
      rentals.forEach((r: { _id: unknown }) => targetIdsForSearch?.push(String(r._id)));
    }

    const { reviews, total } = await this._reviewRepository.getReviewsByReviewer(
      userId,
      page,
      limit,
      search,
      targetIdsForSearch,
    );

    const enrichedReviews = await this._enrichReviews(reviews);

    return { reviews: enrichedReviews, total };
  }

  async getReceivedReviews(
    userId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ reviews: IEnrichedReview[]; total: number }> {
    const targetIds: string[] = [];

    const photographer = await PhotographerModel.findOne({ userId });
    if (photographer) {
      targetIds.push(String(photographer._id));
      const packages = await BookingPackageModel.find({ photographer: photographer._id }).select(
        "_id",
      );
      packages.forEach((pkg: { _id: unknown }) => targetIds.push(String(pkg._id)));
    }

    const rentals = await RentalItemModel.find({ ownerId: userId }).select("_id");
    rentals.forEach((item: { _id: unknown }) => targetIds.push(String(item._id)));

    const { reviews, total } = await this._reviewRepository.getReceivedReviews(
      targetIds,
      page,
      limit,
      search,
    );

    const enrichedReviews = await this._enrichReviews(reviews);
    return { reviews: enrichedReviews, total };
  }

  private async _enrichReviews(reviews: IReview[]): Promise<IEnrichedReview[]> {
    return await Promise.all(
      reviews.map(async (review) => {
        const reviewObj = review.toObject ? review.toObject() : review;
        let targetName = "Unknown Target";
        let targetImage: string | null = null;

        try {
          if (review.type === "photographer") {
            const doc = await PhotographerModel.findById(review.targetId);
            if (doc) {
              targetName = doc.personalInfo?.name || "Photographer Profile";
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
          targetName,
          targetImage,
        } as IEnrichedReview;
      }),
    );
  }

  private async _checkVerification(
    reviewerId: string,
    targetId: string,
    type: string,
  ): Promise<boolean> {
    if (type === "photographer") {
      const hasCompletedBooking = await BookingModel.exists({
        userId: reviewerId,
        photographerId: targetId,
        status: BookingStatus.COMPLETED,
      });
      return !!hasCompletedBooking;
    } else if (type === "package") {
      const hasCompletedBooking = await BookingModel.exists({
        userId: reviewerId,
        packageId: targetId,
        status: BookingStatus.COMPLETED,
      });
      return !!hasCompletedBooking;
    } else if (type === "rental") {
      const hasCompletedOrder = await RentalOrderModel.exists({
        renterId: reviewerId,
        items: { $in: [new mongoose.Types.ObjectId(targetId)] },
        status: RentalStatus.COMPLETED,
      });
      return !!hasCompletedOrder;
    }
    return false;
  }

  private async _validateOwnership(
    reviewerId: string,
    targetId: string,
    type: string,
  ): Promise<void> {
    if (type === "photographer") {
      const photographer = await PhotographerModel.findById(targetId);
      if (photographer && photographer.userId.toString() === reviewerId) {
        throw new AppError("You cannot review your own profile.", HttpStatus.FORBIDDEN);
      }
    } else if (type === "rental") {
      const rental = await RentalItemModel.findById(targetId);
      if (rental && rental.ownerId && rental.ownerId.toString() === reviewerId) {
        throw new AppError("You cannot review your own rental item.", HttpStatus.FORBIDDEN);
      }
    } else if (type === "package") {
      const pkg = await BookingPackageModel.findById(targetId).populate("photographer");
      if (pkg) {
        const photographer = pkg.photographer as unknown as {
          _id?: mongoose.Types.ObjectId;
          userId?: mongoose.Types.ObjectId;
        };
        if (photographer && (photographer.userId || photographer._id)) {
          const ownerUserId =
            photographer.userId?.toString() ||
            (await PhotographerModel.findById(photographer._id))?.userId?.toString();
          if (ownerUserId === reviewerId) {
            throw new AppError("You cannot review your own package.", HttpStatus.FORBIDDEN);
          }
        }
      } else {
        throw new AppError("Package not found.", HttpStatus.NOT_FOUND);
      }
    }
  }
}
