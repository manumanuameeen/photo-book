import { IPortfolioSection } from "../../models/portfolioSection.model.ts";
import { IBaseRepository } from "./IBaseRepository.ts";

export interface IPortfolioRepository extends IBaseRepository<IPortfolioSection> {
  findByPhotographerId(photographerId: string): Promise<IPortfolioSection[]>;
  findByTitle(photographerId: string, title: string): Promise<IPortfolioSection | null>;
  addImage(sectionId: string, imageUrl: string, caption?: string, tags?: string[], embedding?: number[]): Promise<IPortfolioSection | null>;
  removeImage(sectionId: string, imageUrl: string): Promise<IPortfolioSection | null>;
  delete(id: string): Promise<boolean>;
  toggleLike(id: string, userId: string): Promise<IPortfolioSection | null>;
}
