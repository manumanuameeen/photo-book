import { z } from "zod";

export const ApplyPhtographerDto = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10,15}$/, "Invalid phone number"),
  location: z.string().min(3, "Location is required"),

  yearsExperience: z.string().min(1, "Select experience level"),
  specialties: z.array(z.string()).min(1, "At least one specialty is required"),
  priceRange: z.string().min(1, "Price range is required"),
  availability: z.string().min(1, "Availability is required"),

  portfolioWebsite: z.string().url("Invalid URL").optional().or(z.literal("")),
  instagramHandle: z.string().optional().or(z.literal("")),
  personalWebsite: z.string().url("Invalid URL").optional().or(z.literal("")),
  
  portfolioImages: z.array(z.string()).optional().default([]),

  businessName: z.string().min(2, "Business name is required"),
  professionalTitle: z.string().min(2, "Professional title is required"),
  businessBio: z.string().min(50, "Business bio must be at least 50 characters"),
});

export type ApplyPhtographerDtoType = z.infer<typeof ApplyPhtographerDto>;

export class PhotographerResponseDto {
  id!: string;
  status!: string;
  isBlock!: boolean;
  personalInfo!: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  professionalDetails!: {
    specialties: string[];
    priceRange: string;
    experience: string;
  };
  portfolioImages!: string[];
}