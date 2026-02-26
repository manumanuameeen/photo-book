import apiClient from "../apiClient";
import { API_ROUTES } from "../../constants/apiRoutes";

export interface IAdminReport {
    _id: string;
    reporterId: { _id: string, firstName: string, lastName: string, email: string };
    targetId: string;
    targetType: 'photographer' | 'rental' | 'user';
    targetName?: string;
    reason: string;
    subReason?: string;
    evidenceUrls?: string[];
    description: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    adminNotes?: string;
    createdAt: string;
    ownerDetails?: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        profileImage?: string;
    };
    targetMetadata?: {
        name: string;
        image?: string;
        price?: number;
    };
}

export const adminReportApi = {
    getReports: async (page = 1, limit = 10, status?: string) => {
        const response = await apiClient.get(API_ROUTES.REPORT.BASE, {
            params: { page, limit, status }
        });
        return response.data.data;
    },

    updateReportStatus: async (id: string, status: string, adminNotes?: string) => {
        const response = await apiClient.patch(API_ROUTES.REPORT.STATUS(id), {
            status,
            adminNotes
        });
        return response.data.data;
    },

    forwardReportToChat: async (id: string, message: string, recipientType: 'reporter' | 'owner') => {
        const response = await apiClient.post(API_ROUTES.REPORT.FORWARD_CHAT(id), {
            message,
            recipientType
        });
        return response.data.data;
    },

    applyPenalty: async (id: string, penaltyData: { actionTaken: 'warning' | 'block' | 'resolved' | 'false_report_dismissed'; suspensionEndDate?: Date; adminNotes: string }) => {
        const response = await apiClient.post(API_ROUTES.REPORT.APPLY_PENALTY(id), penaltyData);
        return response.data.data;
    }
};
