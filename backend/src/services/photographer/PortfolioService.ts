import { IPortfolioService } from "./IPortfolioService";
import { IPortfolioRepository } from "../../repositories/interface/IPortfolioRepository";
import { IPortfolioSection, PortfolioSectionModel } from "../../model/portfolioSectionModel";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/httpStatus";
import { Messages } from "../../constants/messages";

import mongoose from "mongoose";

export class PortfolioService implements IPortfolioService {
    private _repository: IPortfolioRepository;

    constructor(repository: IPortfolioRepository) {
        this._repository = repository;
    }

    async createSection(photographerId: string, title: string, coverImage?: string): Promise<IPortfolioSection> {
        const existing = await this._repository.findByTitle(photographerId, title);
        if (existing) {
            throw new AppError("Section with this title already exists", HttpStatus.BAD_REQUEST);
        }
        return this._repository.create({ photographerId: new mongoose.Types.ObjectId(photographerId), title, coverImage, images: [] });
    }

    async getSections(photographerId: string): Promise<IPortfolioSection[]> {
        return this._repository.findByPhotographerId(photographerId);
    }

    async deleteSection(photographerId: string, sectionId: string): Promise<void> {
        const section = await this._repository.findById(sectionId);
        if (!section) throw new AppError(Messages.DATA_NOT_FOUND, HttpStatus.NOT_FOUND);
        if (section.photographerId.toString() !== photographerId) {
            throw new AppError(Messages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        }

        const deleted = await this._repository.delete(sectionId);
        if (!deleted) throw new AppError("Failed to delete section", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    async addImage(photographerId: string, sectionId: string, imageUrl: string): Promise<IPortfolioSection> {
        const section = await this._repository.findById(sectionId);
        if (!section) throw new AppError(Messages.DATA_NOT_FOUND, HttpStatus.NOT_FOUND);
        if (section.photographerId.toString() !== photographerId) {
            throw new AppError(Messages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        }

        const updated = await this._repository.addImage(sectionId, imageUrl);
        if (!updated) throw new AppError("Failed to add image", HttpStatus.INTERNAL_SERVER_ERROR);
        return updated;
    }

    async removeImage(photographerId: string, sectionId: string, imageUrl: string): Promise<IPortfolioSection> {
        const section = await this._repository.findById(sectionId);
        if (!section) throw new AppError(Messages.DATA_NOT_FOUND, HttpStatus.NOT_FOUND);
        if (section.photographerId.toString() !== photographerId) {
            throw new AppError(Messages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        }

        const updated = await this._repository.removeImage(sectionId, imageUrl);
        if (!updated) throw new AppError("Failed to remove image", HttpStatus.INTERNAL_SERVER_ERROR);
        return updated;
    }

    async getSectionById(photographerId: string, sectionId: string): Promise<IPortfolioSection | null> {
        const section = await this._repository.findById(sectionId);
        if (section && section.photographerId.toString() !== photographerId) {
            throw new AppError(Messages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        }
        return section;
    }
}
