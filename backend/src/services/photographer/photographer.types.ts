import mongoose from "mongoose";

export interface IPhotographerCreate {
    userId: mongoose.Types.ObjectId;
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
        personalWebsite?: string;
        portfolioImages: string[];
    };

    businessInfo: {
        businessName: string;
        professionalTitle: string;
        businessBio: string;
    };
    status: "PENDING" | "APPROVED" | "REJECTED";
}
