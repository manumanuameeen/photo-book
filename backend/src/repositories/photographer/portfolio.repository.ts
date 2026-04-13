import { BaseRepository } from "../base/BaseRepository";
import { PortfolioSectionModel, IPortfolioSection } from "../../models/portfolioSection.model";
import { IPortfolioRepository } from "../../interfaces/repositories/IPortfolioRepository";

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

  async addImage(
    sectionId: string,
    imageUrl: string,
    caption?: string,
    tags?: string[],
    embedding?: number[],
  ): Promise<IPortfolioSection | null> {
    const imageData = {
      url: imageUrl,
      caption: caption || "",
      tags: tags || [],
      embedding: embedding || [],
    };
    return this._model
      .findByIdAndUpdate(sectionId, { $push: { images: imageData } }, { new: true })
      .exec();
  }

  async removeImage(sectionId: string, imageUrl: string): Promise<IPortfolioSection | null> {
    return this._model
      .findByIdAndUpdate(sectionId, { $pull: { images: { url: imageUrl } } }, { new: true })
      .exec();
  }
}
