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
    createdAt: string;
}

export interface PaginatedPhotographersResponse {
    photographers: Photographer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
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
