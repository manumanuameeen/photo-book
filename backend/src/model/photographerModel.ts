import mongoose, { Schema, Document } from "mongoose";


export interface IPhotographer extends Document {
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
  isBlock: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  createdAt: Date;
}
const PhotographerSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    personalInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      location: { type: String, required: true },
    },
    professionalDetails: {
      yearsExperience: { type: String, required: true },
      specialties: [{ type: String }],
      priceRange: { type: String, required: true },
      availability: { type: String, required: true },
    },
    portfolio: {
      portfolioWebsite: { type: String },
      instagramHandle: { type: String },
      personalWebsite: { type: String },
      portfolioImages: [{ type: String }],
    },
    businessInfo: {
      businessName: { type: String, required: true },
      professionalTitle: { type: String, required: true },
      businessBio: { type: String, required: true, minlength: 50 },
    },
    isBlock: { type: Boolean, default: false },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    rejectionReason: { type: String },
  },
  { timestamps: true },
);
export const PhotographerModel = mongoose.model<IPhotographer>("Photographer", PhotographerSchema);
