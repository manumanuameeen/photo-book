import { IPhotographer } from "../model/photographerModel.ts";
import { IPhotographerResponse } from "../interfaces/services/IAdminPhotographerService.ts";

export class AdminPhotographerMapper {
  static toResponse(photographer: IPhotographer): IPhotographerResponse {
    return {
      id: (photographer._id as any).toString(),
      personalInfo: photographer.personalInfo,
      professionalDetails: photographer.professionalDetails,
      portfolio: {
        portfolioWebsite: photographer.portfolio?.portfolioWebsite || "",
        instagramHandle: photographer.portfolio?.instagramHandle || "",
        portfolioImages: photographer.portfolio?.portfolioImages || [],
      },
      businessInfo: photographer.businessInfo,
      isBlock: photographer.isBlock,
      status: photographer.status,
      rejectionReason: photographer.rejectionReason,
      createdAt: photographer.createdAt.toISOString(),
    };
  }

  static toResponseArray(photographers: IPhotographer[]): IPhotographerResponse[] {
    return photographers.map((p) => this.toResponse(p));
  }
}

