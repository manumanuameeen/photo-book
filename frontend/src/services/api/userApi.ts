import apiClient from "../apiClient";
import type { IUser } from "../../interfaces/user/Iuser";

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
        const response = await apiClient.get('/user/profile');
        return response.data.data;
    },

    updateProfile: async (data: UpdateProfileData): Promise<IUser> => {
        const response = await apiClient.post('/user/profile', data);
        return response.data.data;
    },

    changePassword: async (data: ChangePasswordData): Promise<void> => {
        await apiClient.post('/user/change-password', data);
    },

    uploadProfileImage: async (file: File): Promise<{ imageUrl: string }> => {
        const formData = new FormData();
        formData.append("image", file);
        const response = await apiClient.post('/user/profile-image', formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.data;
    },

    verifyOtp: async (otp: string): Promise<boolean> => {
        const response = await apiClient.post('/user/verify-otp', { otp });
        return response.data.success;
    }
};
