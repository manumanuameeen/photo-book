import apiClient from "../apiClient";
import { API_ROUTES } from "../../constants/apiRoutes";

export interface CreateReportDTO {
    targetId: string;
    targetType: 'photographer' | 'rental' | 'user' | 'package';
    targetName?: string;
    reason: string;
    subReason?: string;
    description: string;
    evidenceUrls?: string[];
}

export interface IReportCategoryResponse {
    _id: string;
    name: string;
    description: string;
    subReasons: string[];
    isActive: boolean;
}

export const reportApi = {
    createReport: async (data: CreateReportDTO) => {
        const response = await apiClient.post(API_ROUTES.REPORT.BASE, data);
        return response.data;
    },
    getCategories: async (): Promise<IReportCategoryResponse[]> => {
        const response = await apiClient.get(API_ROUTES.REPORT_CATEGORY.PUBLIC);
        return response.data.data;
    },

    uploadEvidence: async (files: File[]): Promise<string[]> => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('evidence', file);
        });

        const response = await apiClient.post(API_ROUTES.REPORT.EVIDENCE_UPLOAD, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data.data.urls;
    }
};
