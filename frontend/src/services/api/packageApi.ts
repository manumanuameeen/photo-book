import apiClient from "../apiClient";
import { API_ROUTES } from "../../constants/apiRoutes";

export interface PackageData {
    id?: string;
    photographer?: string;
    name: string;
    description: string;
    price: number;
    editedPhoto: number;
    features: string[];
    deliveryTime: string;
    categoryId: string;
    coverImage?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
    isActive: boolean;
}

interface RawPackageData extends Omit<PackageData, 'id'> {
    _id: string;
    baseprice?: number;
    price: number;
}

export const packageApi = {
    createPackage: async (data: FormData | Omit<PackageData, 'id' | 'status' | 'isActive'>): Promise<PackageData> => {
        const response = await apiClient.post(API_ROUTES.PHOTOGRAPHER.PACKAGES, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data;
    },

    getPackages: async (page = 1, limit = 10): Promise<{ packages: PackageData[]; total: number }> => {
        const response = await apiClient.get(API_ROUTES.PHOTOGRAPHER.PACKAGES, { params: { page, limit } });
        const { packages, total } = response.data.data;
        return {
            packages: packages.map((pkg: RawPackageData) => ({
                ...pkg,
                id: pkg._id,
                price: pkg.baseprice || pkg.price
            })),
            total
        };
    },

    updatePackage: async (id: string, data: FormData | Partial<PackageData>): Promise<PackageData> => {
        const response = await apiClient.put(API_ROUTES.PHOTOGRAPHER.PACKAGE_DETAILS(id), data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data;
    },

    deletePackage: async (id: string): Promise<void> => {
        await apiClient.delete(API_ROUTES.PHOTOGRAPHER.PACKAGE_DETAILS(id));
    },

    getPublicPackages: async (photographerId: string, page = 1, limit = 10): Promise<{ packages: PackageData[]; total: number }> => {
        const response = await apiClient.get(API_ROUTES.PHOTOGRAPHER.PUBLIC.PACKAGES(photographerId), { params: { page, limit } });
        const { packages, total } = response.data.data;
        return {
            packages: (Array.isArray(packages) ? packages.map((pkg: RawPackageData) => ({
                ...pkg,
                id: pkg._id,
                price: pkg.baseprice || pkg.price
            })) : []),
            total: total || 0
        };
    },

    getCategories: async (search?: string): Promise<{ _id: string; name: string }[]> => {
        const queryParams = new URLSearchParams();
        queryParams.append('limit', '50');
        if (search) queryParams.append('search', search);

        const response = await apiClient.get(`${API_ROUTES.PHOTOGRAPHER.PUBLIC.CATEGORIES}?${queryParams.toString()}`);
        return response.data.data?.categories || [];
    },

    suggestCategory: async (name: string, description: string, type: string, explanation: string): Promise<void> => {
        await apiClient.post(API_ROUTES.PHOTOGRAPHER.CATEGORY_SUGGEST, { name, description, type, explanation });
    }
};
