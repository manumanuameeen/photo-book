import { IPhotographer } from "../model/photographerModel";
import { PhotographerResponseDto } from "../dto/photographer.dto";

export class PhotographerMapper {
  static toResponse(data: IPhotographer): PhotographerResponseDto {
    console.log("mapper photographer - images:", data.portfolio.portfolioImages?.length || 0);
    
    return {
      id: data.id.toString(),
      status: data.status,
      isBlock: data.isBlock,

      personalInfo: {
        name: data.personalInfo.name,
        email: data.personalInfo.email,
        phone: data.personalInfo.phone,
        location: data.personalInfo.location,
      },

      professionalDetails: {
        specialties: data.professionalDetails.specialties,
        experience: data.professionalDetails.yearsExperience.toString(),
        priceRange: data.professionalDetails.priceRange,
      },

      portfolioImages: data.portfolio.portfolioImages || [],
    };
  }
}