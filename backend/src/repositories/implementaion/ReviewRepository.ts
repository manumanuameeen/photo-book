import mongoose from "mongoose";
import { BaseRepository } from "../base/BaseRepository.ts";
import { ReviewModel } from "../../model/reviewModel.ts";
import type { IReview } from "../../model/reviewModel.ts";
import { IReviewRepository } from "../../interfaces/repositories/IReviewRepository.ts";

export class ReviewRepository extends BaseRepository<IReview> implements IReviewRepository {
  constructor() {
    super(ReviewModel);
  }

  async addReview(review: Partial<IReview>): Promise<IReview> {
    return await this._model.create(review);
  }

  async getReviewsByTarget(
    targetId: string,
    page: number,
    limit: number,
  ): Promise<{ reviews: IReview[]; total: number }> {
    const skip = (page - 1) * limit;

    const query = { targetId: new mongoose.Types.ObjectId(targetId) };

    const [reviews, total] = await Promise.all([
      this._model
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("reviewerId", "name email profileImage"),
      this._model.countDocuments(query),
    ]);

    return { reviews, total };
  }

  async getReviewStats(targetId: string): Promise<{ average: number; count: number }> {
    const result = await this._model.aggregate([
      { $match: { targetId: new mongoose.Types.ObjectId(targetId) } },
      {
        $group: {
          _id: null,
          average: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      return {
        average: Number(result[0].average.toFixed(1)),
        count: result[0].count,
      };
    }

    return { average: 0, count: 0 };
  }

  async hasReviewed(reviewerId: string, targetId: string, type: string): Promise<boolean> {
    const count = await this._model.countDocuments({
      reviewerId: new mongoose.Types.ObjectId(reviewerId),
      targetId: new mongoose.Types.ObjectId(targetId),
      type,
    });
    return count > 0;
  }

  async addReply(reviewId: string, reply: string): Promise<IReview | null> {
    return await this._model.findByIdAndUpdate(
      reviewId,
      {
        ownerReply: {
          comment: reply,
          createdAt: new Date(),
        },
      },
      { new: true },
    );
  }

  async toggleLike(reviewId: string, userId: string): Promise<IReview | null> {
    const review = await this._model.findById(reviewId);
    if (!review) return null;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const index = review.likes.findIndex((id) => id.equals(userObjectId));

    if (index === -1) {
      review.likes.push(userObjectId);
    } else {
      review.likes.splice(index, 1);
    }

    return await review.save();
  }

  async getReviewById(reviewId: string): Promise<IReview | null> {
    return await this._model.findById(reviewId);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this._model.findByIdAndDelete(id);
    return !!result;
  }

  async getReviewsByReviewer(
    reviewerId: string,
    page: number,
    limit: number,
    search?: string,
    targetIds?: string[],
  ): Promise<{ reviews: IReview[]; total: number }> {
    const skip = (page - 1) * limit;
    const query: mongoose.FilterQuery<IReview> = { reviewerId: new mongoose.Types.ObjectId(reviewerId) };

    if (search) {
      const searchConditions: mongoose.FilterQuery<IReview>[] = [
        { comment: { $regex: search, $options: "i" } },
      ];
      if (targetIds && targetIds.length > 0) {
        searchConditions.push({
          targetId: { $in: targetIds.map((id) => new mongoose.Types.ObjectId(id)) },
        });
      }
      query.$or = searchConditions;
    }

    const [reviews, total] = await Promise.all([
      this._model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      this._model.countDocuments(query),
    ]);

    return { reviews, total };
  }

  async getReceivedReviews(
    targetIds: string[],
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ reviews: IReview[]; total: number }> {
    if (targetIds.length === 0) return { reviews: [], total: 0 };

    const skip = (page - 1) * limit;
    const objectIds = targetIds.map((id) => new mongoose.Types.ObjectId(id));
    const query: Record<string, unknown> = { targetId: { $in: objectIds } };

    if (search) {
      query.comment = { $regex: search, $options: "i" };
    }

    const [reviews, total] = await Promise.all([
      this._model
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("reviewerId", "name email profileImage"),
      this._model.countDocuments(query),
    ]);

    return { reviews, total };
  }

  async update(id: string, payload: Partial<IReview>): Promise<IReview | null> {
    return await this._model.findByIdAndUpdate(id, { $set: payload }, { new: true });
  }
}
