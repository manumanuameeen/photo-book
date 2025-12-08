export interface IPhotographerApplicationForm {
    name: string;
    email: string;
    phone: string;
    location: string;
    yearsExperience: string;
    specialties: string[];
    priceRange: string;
    availability: string;
    portfolioWebsite: string;
    instagramHandle: string;
    personalWebsite: string;
    portfolioImages: File[] | undefined;
    businessName: string;
    professionalTitle: string;
    businessBio: string;
}

export interface IPhotographerApplicationResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        status: string;
        isBlock: boolean;
        personalInfo: {
            name: string;
            email: string;
            phone: string;
            location: string;
        };
        professionalDetails: {
            specialties: string[];
            priceRange: string;
            experience: string;
        };
        portfolioImages: string[];
    }
}
