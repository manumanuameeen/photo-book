import { IPortfolioService } from "../../interfaces/services/IPortfolioService.ts";
import { IPortfolioRepository } from "../../interfaces/repositories/IPortfolioRepository.ts";
import { IPortfolioSection } from "../../models/portfolioSection.model.ts";
import { AppError } from "../../utils/AppError.ts";
import { HttpStatus } from "../../constants/httpStatus.ts";
import { Messages } from "../../constants/messages.ts";

import { IPhotographerRepository } from "../../interfaces/repositories/IPhotographerRepository.ts";

export class PortfolioService implements IPortfolioService {
  private readonly _repository: IPortfolioRepository;
  private readonly _photographerRepository: IPhotographerRepository;

  constructor(repository: IPortfolioRepository, photographerRepository: IPhotographerRepository) {
    this._repository = repository;
    this._photographerRepository = photographerRepository;
  }

  async createSection(
    userId: string,
    title: string,
    coverImage?: string,
  ): Promise<IPortfolioSection> {
    const photographer = await this._photographerRepository.findByUserId(userId);
    if (!photographer) {
      throw new AppError("Photographer profile not found", HttpStatus.NOT_FOUND);
    }
    const existing = await this._repository.findByTitle(photographer.id, title);
    if (existing) {
      throw new AppError("Section with this title already exists", HttpStatus.BAD_REQUEST);
    }
    return this._repository.create({
      photographerId: photographer.id,
      title,
      coverImage,
      images: [],
    });
  }

  async getSections(photographerId: string): Promise<IPortfolioSection[]> {
    return this._repository.findByPhotographerId(photographerId);
  }

  async getSectionsByUserId(userId: string): Promise<IPortfolioSection[]> {
    const photographer = await this._photographerRepository.findByUserId(userId);
    if (!photographer) {
      throw new AppError("Photographer profile not found", HttpStatus.NOT_FOUND);
    }
    return this._repository.findByPhotographerId(photographer.id);
  }

  async deleteSection(userId: string, sectionId: string): Promise<void> {
    const section = await this._repository.findById(sectionId);
    if (!section) throw new AppError(Messages.DATA_NOT_FOUND, HttpStatus.NOT_FOUND);

    const photographer = await this._photographerRepository.findByUserId(userId);
    if (!photographer) {
      throw new AppError("Photographer profile not found", HttpStatus.NOT_FOUND);
    }

    if (section.photographerId.toString() !== photographer.id.toString()) {
      throw new AppError(Messages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    const deleted = await this._repository.delete(sectionId);
    if (!deleted) throw new AppError("Failed to delete section", HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async addImage(userId: string, sectionId: string, imageUrl: string, caption?: string, tags?: string[], embedding?: number[]): Promise<IPortfolioSection> {
    const section = await this._repository.findById(sectionId);
    if (!section) throw new AppError(Messages.DATA_NOT_FOUND, HttpStatus.NOT_FOUND);

    const photographer = await this._photographerRepository.findByUserId(userId);
    if (!photographer) {
      throw new AppError("Photographer profile not found", HttpStatus.NOT_FOUND);
    }

    if (section.photographerId.toString() !== photographer.id.toString()) {
      throw new AppError(Messages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    const updated = await this._repository.addImage(sectionId, imageUrl, caption, tags, embedding);
    if (!updated) throw new AppError("Failed to add image", HttpStatus.INTERNAL_SERVER_ERROR);
    return updated;
  }

  async removeImage(
    userId: string,
    sectionId: string,
    imageUrl: string,
  ): Promise<IPortfolioSection> {
    const section = await this._repository.findById(sectionId);
    if (!section) throw new AppError(Messages.DATA_NOT_FOUND, HttpStatus.NOT_FOUND);

    const photographer = await this._photographerRepository.findByUserId(userId);
    if (!photographer) {
      throw new AppError("Photographer profile not found", HttpStatus.NOT_FOUND);
    }

    if (section.photographerId.toString() !== photographer.id.toString()) {
      throw new AppError(Messages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    const updated = await this._repository.removeImage(sectionId, imageUrl);
    if (!updated) throw new AppError("Failed to remove image", HttpStatus.INTERNAL_SERVER_ERROR);
    return updated;
  }

  async getSectionById(userId: string, sectionId: string): Promise<IPortfolioSection | null> {
    const section = await this._repository.findById(sectionId);
    if (!section) return null;

    const photographer = await this._photographerRepository.findByUserId(userId);
    if (!photographer) {
      throw new AppError("Photographer profile not found", HttpStatus.NOT_FOUND);
    }

    if (section.photographerId.toString() !== photographer.id.toString()) {
      throw new AppError(Messages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    return section;
  }

  async toggleLike(userId: string, sectionId: string): Promise<IPortfolioSection> {
    const section = await this._repository.toggleLike(sectionId, userId);
    if (!section) throw new AppError("Portfolio section not found", HttpStatus.NOT_FOUND);
    return section;
  }
}
