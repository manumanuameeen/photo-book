import { ApplyPhtographerDtoType, PhotographerResponseDto } from "../../dto/photographer.dto";
import mongoose from "mongoose";
import type { IPhotographerRepository } from "../../repositories/interface/IPhotographerRepository";
import type { IPhotographerCreate } from "./photographer.types";
import type { IPhotographerService } from "./IPhotographerService";
import { PhotographerMapper } from "../../mappers/photographerMapper";
import { AppError } from "../../utils/AppError";
import { Messages } from "../../constants/messages";
import { HttpStatus } from "../../constants/httpStatus";

export class PhotographerService implements IPhotographerService {
  private _repository: IPhotographerRepository;

  constructor(repository: IPhotographerRepository) {
    this._repository = repository;
  }

  async apply(userId: string, data: ApplyPhtographerDtoType): Promise<PhotographerResponseDto> {
    console.log("photographer service - images count:", data.portfolioImages?.length || 0);
    
    const specialtiesArray = Array.isArray(data.specialties)
      ? data.specialties
      : [data.specialties];

    const newApplication: IPhotographerCreate = {
      userId: new mongoose.Types.ObjectId(userId),
      personalInfo: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location,
      },
      professionalDetails: {
        yearsExperience: data.yearsExperience,
        specialties: specialtiesArray,
        priceRange: data.priceRange,
        availability: data.availability,
      },
      portfolio: {
        portfolioWebsite: data.portfolioWebsite || undefined,
        instagramHandle: data.instagramHandle || undefined,
        personalWebsite: data.personalWebsite || undefined,
        portfolioImages: data.portfolioImages || [], // ✅ Now contains Cloudinary URLs
      },
      businessInfo: {
        businessName: data.businessName,
        professionalTitle: data.professionalTitle,
        businessBio: data.businessBio,
      },
      status: "PENDING",
    };

    const existing = await this._repository.findByUserId(userId);
    if (existing) {
      if (existing.status === "PENDING" || existing.status === "APPROVED") {
        throw new AppError(Messages.ALREADY_PHOTOGRAPHER, HttpStatus.CONFLICT);
      }
      if (existing.status === "REJECTED") {
        const updatedData = { ...newApplication, rejectionReason: "" };
        const updated = await this._repository.update(existing.id, updatedData as any);
        if (!updated) {
          throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        console.log("Updated photographer - images:", updated.portfolio.portfolioImages?.length || 0);
        return PhotographerMapper.toResponse(updated);
      }
    }

    const created = await this._repository.create(newApplication as any);
    console.log("Created photographer - images:", created.portfolio.portfolioImages?.length || 0);
    return PhotographerMapper.toResponse(created);
  }
}