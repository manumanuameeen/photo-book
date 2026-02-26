import apiClient from "../apiClient";
import type { IUser } from "../../interfaces/user/Iuser";
import { API_ROUTES } from "../../constants/apiRoutes";

export interface UpdateProfileData {
    name?: string;
    phone?: string;
    bio?: string;
    location?: string;
    lat?: number | null;
    lng?: number | null;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export const userApi = {
    getProfile: async (): Promise<IUser> => {
        const response = await apiClient.get(API_ROUTES.USER.PROFILE);
        return response.data.data;
    },

    updateProfile: async (data: UpdateProfileData): Promise<IUser> => {
        const response = await apiClient.post(API_ROUTES.USER.PROFILE, data);
        return response.data.data;
    },

    changePassword: async (data: ChangePasswordData): Promise<void> => {
        await apiClient.post(API_ROUTES.USER.CHANGE_PASSWORD, data);
    },

    uploadProfileImage: async (file: File): Promise<{ imageUrl: string }> => {
        const formData = new FormData();
        formData.append("image", file);
        const response = await apiClient.post(API_ROUTES.USER.PROFILE_IMAGE, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.data;
    },

    verifyOtp: async (otp: string): Promise<boolean> => {
        const response = await apiClient.post(API_ROUTES.USER.VERIFY_OTP, { otp });
        return response.data.success;
    }
};
