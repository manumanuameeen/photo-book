import { BaseRepository } from "../../base/BaseRepository";
import type { IPaginatedPhotographers, IPhotographerQuery, IPhotographerRepository, IPhotographerStats } from "../../interface/IPhotographerRepository";
import { PhotographerModel } from "../../../model/photographerModel";
import type { IPhotographer } from "../../../model/photographerModel";



export class PhotographerRepository extends BaseRepository<IPhotographer> implements IPhotographerRepository {

  constructor() {
    super(PhotographerModel);
  }

  async findByUserId(userId: string): Promise<IPhotographer | null> {
    return await this.findOne({ userId: userId as any } as Partial<IPhotographer>);
  }


  async findAllWithPagination(query: IPhotographerQuery): Promise<IPaginatedPhotographers> {
    const { page, limit, search, status, isBlocked } = query;
    const skip = (page - 1) * limit;
    const filter: any = {};

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
    const [photographers, total ,approvedCount, pendingCount, rejectedCount,] = await Promise.all([
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
      rejectedCount
    };
  }

  async blockById(id: string): Promise<IPhotographer | null> {
    return await this.update(id, { isBlock: true } as Partial<IPhotographer>);
  }
  async unblockById(id: string): Promise<IPhotographer | null> {
    return await this.update(id, { isBlock: false } as Partial<IPhotographer>);
  }

  async approveById(id: string): Promise<IPhotographer | null> {
    return await this.update(id, { status: "APPROVED" } as Partial<IPhotographer>);
  }

  async rejectById(id: string, reason: string): Promise<IPhotographer | null> {
    return await this.update(id, { status: "REJECTED", rejectionReason: reason } as Partial<IPhotographer>);
  }

  async getStatistics(): Promise<IPhotographerStats> {
    const [total, approved, pending, rejected, blocked] = await Promise.all([
      this._model.countDocuments(),
      this._model.countDocuments({ status: "APPROVED" }),
      this._model.countDocuments({ status: "PENDING" }),
      this._model.countDocuments({ status: "REJECTED" }),
      this._model.countDocuments({ isBlock: true })
    ])

    return { total, approved, pending, rejected, blocked }
  }

}
