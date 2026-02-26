import apiClient from "../apiClient";
import { API_ROUTES } from "../../constants/apiRoutes";

export interface IPortfolioSection {
    _id: string;
    title: string;
    coverImage?: string;
    images: string[];
}

export const portfolioApi = {
    createSection: async (title: string, coverImage?: string) => {
        const response = await apiClient.post(API_ROUTES.PHOTOGRAPHER.PORTFOLIO_SECTION, { title, coverImage });
        return response.data.data;
    },

    getSections: async () => {
        const response = await apiClient.get(API_ROUTES.PHOTOGRAPHER.PORTFOLIO_SECTIONS);
        return response.data.data;
    },

    deleteSection: async (id: string) => {
        const response = await apiClient.delete(API_ROUTES.PHOTOGRAPHER.PORTFOLIO_SECTION_DETAILS(id));
        return response.data.data;
    },

    addImage: async (sectionId: string, image: string | File) => {
        if (image instanceof File) {
            const formData = new FormData();
            formData.append('image', image);

            const response = await apiClient.post(API_ROUTES.PHOTOGRAPHER.PORTFOLIO_IMAGE(sectionId), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data.data;
        }
        const response = await apiClient.post(API_ROUTES.PHOTOGRAPHER.PORTFOLIO_IMAGE(sectionId), { imageUrl: image });
        return response.data.data;
    },

    removeImage: async (sectionId: string, imageUrl: string) => {
        const response = await apiClient.delete(API_ROUTES.PHOTOGRAPHER.PORTFOLIO_IMAGE(sectionId), { data: { imageUrl } });
        return response.data.data;
    }
};
