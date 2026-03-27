import { IPortfolioSection } from "../../models/portfolioSection.model";

export interface IPortfolioService {
  createSection(userId: string, title: string, coverImage?: string): Promise<IPortfolioSection>;
  getSections(photographerId: string): Promise<IPortfolioSection[]>;
  getSectionsByUserId(userId: string): Promise<IPortfolioSection[]>;
  deleteSection(userId: string, sectionId: string): Promise<void>;
  addImage(
    userId: string,
    sectionId: string,
    imageUrl: string,
    caption?: string,
    tags?: string[],
    embedding?: number[],
  ): Promise<IPortfolioSection>;
  removeImage(userId: string, sectionId: string, imageUrl: string): Promise<IPortfolioSection>;
  getSectionById(userId: string, sectionId: string): Promise<IPortfolioSection | null>;
  toggleLike(userId: string, sectionId: string): Promise<IPortfolioSection>;
}
