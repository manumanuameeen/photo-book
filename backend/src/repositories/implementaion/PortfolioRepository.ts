import { BaseRepository } from "../base/BaseRepository.ts";
import { PortfolioSectionModel, IPortfolioSection } from "../../model/portfolioSectionModel.ts";
import { IPortfolioRepository } from "../../interfaces/repositories/IPortfolioRepository.ts";

export class PortfolioRepository
  extends BaseRepository<IPortfolioSection>
  implements IPortfolioRepository
{
  constructor() {
    super(PortfolioSectionModel);
  }

  async findByPhotographerId(photographerId: string): Promise<IPortfolioSection[]> {
    return this._model.find({ photographerId }).exec();
  }

  async findByTitle(photographerId: string, title: string): Promise<IPortfolioSection | null> {
    return this._model.findOne({ photographerId, title }).exec();
  }

  async addImage(sectionId: string, imageUrl: string): Promise<IPortfolioSection | null> {
    return this._model
      .findByIdAndUpdate(sectionId, { $push: { images: imageUrl } }, { new: true })
      .exec();
  }

  async removeImage(sectionId: string, imageUrl: string): Promise<IPortfolioSection | null> {
    return this._model
      .findByIdAndUpdate(sectionId, { $pull: { images: imageUrl } }, { new: true })
      .exec();
  }
}

