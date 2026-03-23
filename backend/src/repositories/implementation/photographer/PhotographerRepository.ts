import { BaseRepository } from "../../base/BaseRepository.ts";
import type {
  IPaginatedPhotographers,
  IPhotographerQuery,
  IPhotographerRepository,
  IPhotographerStats,
  IPublicPhotographer,
} from "../../../interfaces/repositories/IPhotographerRepository.ts";
import { IPaginatedPhotographerResponse } from "../../../dto/photographer.dto.ts";
import { PhotographerModel } from "../../../models/photographer.model.ts";
import type { IPhotographer } from "../../../models/photographer.model.ts";
import mongoose, { FilterQuery, PipelineStage } from "mongoose";

export class PhotographerRepository
  extends BaseRepository<IPhotographer>
  implements IPhotographerRepository
{
  constructor() {
    super(PhotographerModel);
  }

  async findByUserId(userId: string): Promise<IPhotographer | null> {
    return await this.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    } as FilterQuery<IPhotographer>);
  }

  async findAllWithPagination(query: IPhotographerQuery): Promise<IPaginatedPhotographers> {
    const { page, limit, search, status, isBlocked } = query;
    const skip = (page - 1) * limit;
    const filter: FilterQuery<IPhotographer> = {};

    if (status && status !== "ALL") {
      filter.status = status;
    }

    if (isBlocked === "true") {
      filter.isBlock = true;
    }

    if (search) {
      filter.$or = [
        { "personalInfo.name": { $regex: search, $options: "i" } },
        { "personalInfo.email": { $regex: search, $options: "i" } },
        { "businessInfo.businessName": { $regex: search, $options: "i" } },
      ];
    }
    const [photographers, total, approvedCount, pendingCount, rejectedCount] = await Promise.all([
      this._model.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this._model.countDocuments(filter),
      this._model.countDocuments({ status: "APPROVED" }),
      this._model.countDocuments({ status: "PENDING" }),
      this._model.countDocuments({ status: "REJECTED" }),
    ]);

    return {
      photographers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      approvedCount,
      pendingCount,
      rejectedCount,
    };
  }

  async blockById(id: string): Promise<IPhotographer | null> {
    return await this.update(id, { isBlock: true } as Partial<IPhotographer>);
  }
  async unblockById(id: string): Promise<IPhotographer | null> {
    return await this.update(id, { isBlock: false } as Partial<IPhotographer>);
  }

  async approveById(id: string, message: string): Promise<IPhotographer | null> {
    return await this.update(id, {
      status: "APPROVED",
      approvalMessage: message,
    } as Partial<IPhotographer>);
  }

  async rejectById(id: string, reason: string): Promise<IPhotographer | null> {
    return await this.update(id, {
      status: "REJECTED",
      rejectionReason: reason,
    } as Partial<IPhotographer>);
  }

  async getStatistics(): Promise<IPhotographerStats> {
    const [total, approved, pending, rejected, blocked] = await Promise.all([
      this._model.countDocuments(),
      this._model.countDocuments({ status: "APPROVED" }),
      this._model.countDocuments({ status: "PENDING" }),
      this._model.countDocuments({ status: "REJECTED" }),
      this._model.countDocuments({ isBlock: true }),
    ]);

    return { total, approved, pending, rejected, blocked };
  }

  async getPublicPhotographers(filters: {
    category?: string;
    priceRange?: string;
    location?: string;
    lat?: number;
    lng?: number;
    page: number;
    limit: number;
  }): Promise<IPaginatedPhotographerResponse> {
    const pipeline: PipelineStage[] = [{ $match: { status: "APPROVED", isBlock: false } }];

    pipeline.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    });
    pipeline.push({ $unwind: "$user" });

    if (filters.lat && filters.lng) {
      const LAT_RANGE = 0.25;
      const LNG_RANGE = 0.25;

      pipeline.push({
        $match: {
          "user.lat": {
            $gte: Number(filters.lat) - LAT_RANGE,
            $lte: Number(filters.lat) + LAT_RANGE,
          },
          "user.lng": {
            $gte: Number(filters.lng) - LNG_RANGE,
            $lte: Number(filters.lng) + LNG_RANGE,
          },
        },
      });
    } else if (filters.location && filters.location !== "All Locations") {
      pipeline.push({
        $match: {
          "user.location": { $regex: filters.location, $options: "i" },
        },
      });
    }

    pipeline.push({
      $lookup: {
        from: "bookingpackages",
        localField: "_id",
        foreignField: "photographer",
        as: "packages",
      },
    });

    pipeline.push({
      $addFields: {
        packages: {
          $filter: {
            input: "$packages",
            as: "pkg",
            cond: {
              $and: [
                { $eq: ["$$pkg.isActive", true] },
                { $in: ["$$pkg.status", ["APPROVED", "ACTIVE"]] },
              ],
            },
          },
        },
      },
    });

    pipeline.push({
      $lookup: {
        from: "categories",
        localField: "packages.categoryId",
        foreignField: "_id",
        as: "categories",
      },
    });

    if (filters.category && filters.category !== "All Categories") {
      pipeline.push({
        $match: {
          "categories.name": filters.category,
        },
      });
    }

    pipeline.push({
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "targetId",
        as: "photographerReviews",
      },
    });

    pipeline.push({
      $addFields: {
        photographerReviews: {
          $filter: {
            input: "$photographerReviews",
            as: "review",
            cond: { $eq: ["$$review.type", "photographer"] },
          },
        },
      },
    });

    pipeline.push({
      $project: {
        id: "$_id",
        userId: "$user._id",
        name: { $ifNull: ["$personalInfo.name", "$user.name"] },
        image: {
          $ifNull: ["$user.profileImage", { $arrayElemAt: ["$portfolio.portfolioImages", 0] }],
        },
        category: { $ifNull: [{ $arrayElemAt: ["$categories.name", 0] }, "General"] },
        location: { $ifNull: ["$personalInfo.location", "$user.location"] },
        rating: {
          $ifNull: [{ $round: [{ $avg: "$photographerReviews.rating" }, 1] }, 0],
        },
        reviews: { $size: "$photographerReviews" },
        price: {
          $cond: {
            if: { $gt: [{ $size: "$packages" }, 0] },
            then: {
              $concat: [{ $literal: "$" }, { $toString: { $min: "$packages.baseprice" } }, "/hour"],
            },
            else: "Unavailable",
          },
        },
        photosCount: {
          $concat: [{ $toString: { $size: "$portfolio.portfolioImages" } }, " photos"],
        },
        experience: "$professionalDetails.yearsExperience",
        tags: "$categories.name",
        available: { $literal: true },
        type: { $literal: "individual" },
      },
    });

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    pipeline.push({
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    });

    const result = await this._model.aggregate(pipeline);
    const photographers = result[0]?.data || [];
    const total = result[0]?.totalCount?.[0]?.count || 0;

    return {
      photographers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPublicPhotographerById(id: string): Promise<IPublicPhotographer | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const pipeline: PipelineStage[] = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          status: "APPROVED",
          isBlock: false,
        },
      },
    ];

    pipeline.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    });
    pipeline.push({ $unwind: "$user" });

    pipeline.push({
      $lookup: {
        from: "bookingpackages",
        localField: "_id",
        foreignField: "photographer",
        as: "packages",
      },
    });

    pipeline.push({
      $addFields: {
        packages: {
          $filter: {
            input: "$packages",
            as: "pkg",
            cond: {
              $and: [
                { $eq: ["$$pkg.isActive", true] },
                { $in: ["$$pkg.status", ["APPROVED", "ACTIVE"]] },
              ],
            },
          },
        },
      },
    });

    pipeline.push({
      $lookup: {
        from: "categories",
        localField: "packages.categoryId",
        foreignField: "_id",
        as: "categories",
      },
    });

    pipeline.push({
      $lookup: {
        from: "portfoliosections",
        localField: "_id",
        foreignField: "photographerId",
        as: "portfolioSections",
      },
    });

    pipeline.push({
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "targetId",
        as: "photographerReviews",
      },
    });

    pipeline.push({
      $addFields: {
        photographerReviews: {
          $filter: {
            input: "$photographerReviews",
            as: "review",
            cond: { $eq: ["$$review.type", "photographer"] },
          },
        },
      },
    });

    pipeline.push({
      $project: {
        id: "$_id",
        userId: "$userId",
        name: { $ifNull: ["$personalInfo.name", "$user.name"] },
        image: {
          $ifNull: ["$user.profileImage", { $arrayElemAt: ["$portfolio.portfolioImages", 0] }],
        },
        category: { $ifNull: [{ $arrayElemAt: ["$categories.name", 0] }, "General"] },
        location: { $ifNull: ["$personalInfo.location", "$user.location"] },
        rating: {
          $ifNull: [{ $round: [{ $avg: "$photographerReviews.rating" }, 1] }, 0],
        },
        reviewsCount: { $size: "$photographerReviews" },
        price: {
          $cond: {
            if: { $gt: [{ $size: "$packages" }, 0] },
            then: { $min: "$packages.baseprice" },
            else: 0,
          },
        },
        photosCount: { $size: "$portfolio.portfolioImages" },
        experience: "$professionalDetails.yearsExperience",
        tags: "$categories.name",
        available: { $literal: true },
        type: { $literal: "individual" },

        bio: "$businessInfo.businessBio",
        portfolio: "$portfolio.portfolioImages",
        portfolioSections: {
          $map: {
            input: "$portfolioSections",
            as: "section",
            in: {
              id: "$$section._id",
              title: "$$section.title",
              images: "$$section.images",
            },
          },
        },
        packages: {
          $map: {
            input: "$packages",
            as: "pkg",
            in: {
              id: "$$pkg._id",
              name: "$$pkg.name",
              price: "$$pkg.baseprice",
              features: "$$pkg.features",
              description: "$$pkg.description",
            },
          },
        },
        reviews: { $literal: [] },
      },
    });

    const result = await this._model.aggregate<IPublicPhotographer>(pipeline);
    return result[0] || null;
  }
}
