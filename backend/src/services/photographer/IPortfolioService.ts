import { IPortfolioSection } from "../../model/portfolioSectionModel";

export interface IPortfolioService {
    createSection(photographerId: string, title: string, coverImage?: string): Promise<IPortfolioSection>;
    getSections(photographerId: string): Promise<IPortfolioSection[]>;
    deleteSection(photographerId: string, sectionId: string): Promise<void>;
    addImage(photographerId: string, sectionId: string, imageUrl: string): Promise<IPortfolioSection>;
    removeImage(photographerId: string, sectionId: string, imageUrl: string): Promise<IPortfolioSection>;
    getSectionById(photographerId: string, sectionId: string): Promise<IPortfolioSection | null>;
}
