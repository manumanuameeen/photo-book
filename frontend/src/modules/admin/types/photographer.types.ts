export interface Photographer {
    id: string;
    personalInfo: {
        name: string;
        email: string;
        phone: string;
        location: string;
    };
    professionalDetails: {
        yearsExperience: string;
        specialties: string[];
        priceRange: string;
        availability: string;
    };
    portfolio: {
        portfolioWebsite?: string;
        instagramHandle?: string;
        portfolioImages: string[];
    };
    businessInfo: {
        businessName: string;
        professionalTitle: string;
        businessBio: string;
    };
    isBlock: boolean;
    status: "PENDING" | "APPROVED" | "REJECTED";
    rejectionReason?: string;
    completedBookingsCount?: number;
    createdAt: string;
}

export interface PaginatedPhotographersResponse {
    photographers: Photographer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    approvedCount: number,
    pendingCount: number,
    rejectedCount: number
}

export interface GetPhotographersParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: "PENDING" | "APPROVED" | "REJECTED" | "ALL";
    isBlocked?: "true" | "false" | "all";
}

export interface PhotographerStats {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    blocked: number;
}

export interface IAdminPackage {
    _id: string;
    photographer: {
        _id: string;
        personalInfo: {
            name: string;
            email: string;
        };
    };
    name: string;
    description: string;
    price: number;
    baseprice?: number;
    editedPhoto: number;
    features: string[];
    deliveryTime: string;
    coverImage?: string;
    isActive: boolean;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
    categoryId: {
        _id: string;
        name: string;
    };
    createdAt: string;
}
