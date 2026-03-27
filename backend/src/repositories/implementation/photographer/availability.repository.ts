import { BaseRepository } from "../../base/BaseRepository";
import { AvailabilityModel, IAvailability } from "../../../models/availability.model";
import { IAvailabilityRepository } from "../../../interfaces/repositories/IAvailabilityRepository";

export class AvailabilityRepository
  extends BaseRepository<IAvailability>
  implements IAvailabilityRepository
{
  constructor() {
    super(AvailabilityModel);
  }

  async findByPhotographerAndDate(
    photographerId: string,
    date: Date,
  ): Promise<IAvailability | null> {
    return await this._model.findOne({ photographer: photographerId, date: date }).exec();
  }

  async findByPhotographerAndDateRange(
    photographerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<IAvailability[]> {
    return await this._model
      .find({
        photographer: photographerId,
        date: { $gte: startDate, $lte: endDate },
      })
      .exec();
  }
}
