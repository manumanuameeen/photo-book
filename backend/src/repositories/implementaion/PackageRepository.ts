import { BaseRepository } from "../base/BaseRepository";
import mongoose from "mongoose";
import { BookingPackageModel, IBookingPackage } from "../../model/bookingPackageModel";
import { IPackageRepository } from "../interface/IPackageRepository";

export class PackageRepository extends BaseRepository<IBookingPackage> implements IPackageRepository {
    constructor() {
        super(BookingPackageModel);
    }

    async findByPhotographerId(photographerId: string): Promise<IBookingPackage[]> {
        return await this._model.find({ photographer: new mongoose.Types.ObjectId(photographerId) }).exec();
    }
}
