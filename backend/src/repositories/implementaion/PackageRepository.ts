import { BaseRepository } from "../base/BaseRepository.ts";
import mongoose from "mongoose";
import { BookingPackageModel, IBookingPackage } from "../../model/bookingPackageModel.ts";
import { IPackageRepository } from "../../interfaces/repositories/IPackageRepository.ts";

export class PackageRepository
  extends BaseRepository<IBookingPackage>
  implements IPackageRepository {
  constructor() {
    super(BookingPackageModel);
  }

  async findByPhotographerId(photographerId: string, page = 1, limit = 10): Promise<{ packages: IBookingPackage[]; total: number }> {
    const skip = (page - 1) * limit;
    const [packages, total] = await Promise.all([
      this._model
        .find({ photographer: new mongoose.Types.ObjectId(photographerId) })
        .skip(skip)
        .limit(limit)
        .exec(),
      this._model.countDocuments({ photographer: new mongoose.Types.ObjectId(photographerId) })
    ]);
    return { packages, total };
  }
}
