import apiClient from "../apiClient";
import { API_ROUTES } from "../../constants/apiRoutes";

export interface PhotographerProfileData {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        profileImage?: string;
        phone?: string;
    };
    businessName: string;
    description: string;
    baseLocation: string;
    professionalDetails: {
        mainGenre: string;
        standardRate: number;
        noticeInterval: string;
        bufferTime: string;
        instagram?: string;
        website?: string;
        facebook?: string;
        linkedin?: string;
    };
    specialties: string[];
    portfolioImages: string[];
    status: string;
    createdAt: string;
}

export const photographerApi = {
    getProfile: async (): Promise<PhotographerProfileData> => {
        const response = await apiClient.get(API_ROUTES.PHOTOGRAPHER.PROFILE);
        return response.data.data;
    },

    updateProfile: async (data: Partial<PhotographerProfileData>): Promise<PhotographerProfileData> => {
        const response = await apiClient.put(API_ROUTES.PHOTOGRAPHER.PROFILE, data);
        return response.data.data;
    }
};
