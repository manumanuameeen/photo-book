import { BaseRepository } from "../base/BaseRepository.ts";
import mongoose from "mongoose";
import { BookingPackageModel, IBookingPackage } from "../../model/bookingPackageModel.ts";
import { IPackageRepository } from "../../interfaces/repositories/IPackageRepository.ts";

export class PackageRepository
  extends BaseRepository<IBookingPackage>
  implements IPackageRepository
{
  constructor() {
    super(BookingPackageModel);
  }

  async findByPhotographerId(photographerId: string): Promise<IBookingPackage[]> {
    return await this._model
      .find({ photographer: new mongoose.Types.ObjectId(photographerId) })
      .exec();
  }
}

