import apiClient from "../apiClient";

export interface IPortfolioSection {
    _id: string;
    title: string;
    coverImage?: string;
    images: string[];
}

export const portfolioApi = {
    createSection: async (title: string, coverImage?: string) => {
        const response = await apiClient.post("/photographer/portfolio/section", { title, coverImage });
        return response.data.data;
    },

    getSections: async () => {
        const response = await apiClient.get("/photographer/portfolio/sections");
        return response.data.data;
    },

    deleteSection: async (id: string) => {
        const response = await apiClient.delete(`/photographer/portfolio/section/${id}`);
        return response.data.data;
    },

    addImage: async (sectionId: string, image: string | File) => {
        if (image instanceof File) {
            const formData = new FormData();
            formData.append('image', image);
            // payload = formData;
            // When sending FormData, axios/client usually handles headers, but if using custom client, ensure content-type is set
            const response = await apiClient.post(`/photographer/portfolio/section/${sectionId}/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data.data;
        }
        const response = await apiClient.post(`/photographer/portfolio/section/${sectionId}/image`, { imageUrl: image });
        return response.data.data;
    },

    removeImage: async (sectionId: string, imageUrl: string) => {
        const response = await apiClient.delete(`/photographer/portfolio/section/${sectionId}/image`, { data: { imageUrl } });
        return response.data.data;
    }
};
