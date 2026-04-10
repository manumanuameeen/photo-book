/**
 * Shutter Assistant Service
 * Enhanced AI assistant for photographer recommendations and booking guidance
 * Integrates with the Photo-book platform's photographer database
 */

import { PhotographerModel, IPhotographer } from "../../models/photographer.model";
import { ReviewModel } from "../../models/review.model";
import mongoose, { FilterQuery } from "mongoose";

export interface PhotographerRecommendation {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  location: string;
  photosCount: number;
  whyFit: string;
}

/**
 * Extract photographer recommendations based on user preferences
 * This function queries the database for photographers matching user criteria
 */
export const getPhotographerRecommendations = async (
  category?: string,
  location?: string,
  priceRange?: string,
  limit: number = 3,
): Promise<PhotographerRecommendation[]> => {
  try {
    const filter: FilterQuery<IPhotographer> = {
      status: "APPROVED",
      isBlock: false,
    };

    // Build filter based on category
    if (category) {
      filter["professionalDetails.specialties"] = {
        $regex: category,
        $options: "i",
      };
    }

    // Build filter based on location
    if (location && location !== "All Locations") {
      filter["personalInfo.location"] = {
        $regex: location,
        $options: "i",
      };
    }

    // Fetch photographers
    const photographers = await PhotographerModel.find(filter).limit(limit).lean();

    // Enrich with reviews
    const recommendations: PhotographerRecommendation[] = [];

    for (const photographer of photographers) {
      const reviews = await ReviewModel.find({
        targetId: new mongoose.Types.ObjectId(photographer._id as string),
        type: "photographer",
      });

      const avgRating =
        reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

      recommendations.push({
        id: (photographer._id as string).toString(),
        name: photographer.personalInfo.name,
        specialty: photographer.professionalDetails.specialties.join(", "),
        experience: photographer.professionalDetails.yearsExperience,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
        priceRange: photographer.professionalDetails.priceRange,
        location: photographer.personalInfo.location,
        photosCount: photographer.portfolio.portfolioImages.length,
        whyFit: `${photographer.personalInfo.name} specializes in ${photographer.professionalDetails.specialties[0] || "photography"} with ${photographer.professionalDetails.yearsExperience} years of experience.`,
      });
    }

    return recommendations;
  } catch (error) {
    console.error("[Shutter Assistant] Error fetching recommendations:", error);
    return [];
  }
};

/**
 * Format photographer recommendations for display in chat
 */
export const formatPhotographerRecommendations = (
  photographers: PhotographerRecommendation[],
): string => {
  if (photographers.length === 0) {
    return "I couldn't find photographers matching your criteria right now. Try adjusting your preferences or check back soon!";
  }

  let response = "Based on your needs, here are some excellent photographers:\n\n";

  photographers.forEach((photographer, index) => {
    response += `📸 **${photographer.name}** — ⭐ ${photographer.rating}/5.0 (${photographer.reviewCount} reviews)\n`;
    response += `• Specialty: ${photographer.specialty}\n`;
    response += `• Experience: ${photographer.experience} years\n`;
    response += `• Pricing: ${photographer.priceRange}\n`;
    response += `• Portfolio: ${photographer.photosCount} photos\n`;
    response += `• Location: ${photographer.location}\n`;
    response += `• Why they're a great fit: ${photographer.whyFit}\n\n`;
  });

  response +=
    "Would you like to see more details about any of these photographers, or would you like me to help you refine your search?";

  return response;
};

/**
 * Extract user preferences from conversation
 * This helps identify when to recommend photographers
 */
export const extractUserPreferences = (
  conversationHistory: Array<{ role: string; content: string }>,
): {
  category?: string;
  location?: string;
  priceRange?: string;
  hasPreferences: boolean;
} => {
  const allText = conversationHistory
    .map((m) => m.content)
    .join(" ")
    .toLowerCase();

  const preferences: { category?: string; location?: string; priceRange?: string; hasPreferences: boolean } = { hasPreferences: false };

  // Extract category
  const categories = [
    "wedding",
    "portrait",
    "event",
    "product",
    "real estate",
    "fashion",
    "sports",
    "wildlife",
    "landscape",
    "food",
    "newborn",
    "maternity",
    "corporate",
    "pets",
    "architecture",
    "cars",
    "nikah",
    "intimate",
  ];

  for (const cat of categories) {
    if (allText.includes(cat)) {
      preferences.category = cat;
      preferences.hasPreferences = true;
      break;
    }
  }

  // Extract location (simple pattern matching)
  if (
    allText.includes("new york") ||
    allText.includes("ny") ||
    allText.includes("los angeles") ||
    allText.includes("la")
  ) {
    preferences.location =
      allText.includes("new york") || allText.includes("ny") ? "New York" : "Los Angeles";
    preferences.hasPreferences = true;
  }

  // Extract price range
  if (allText.includes("budget") || allText.includes("affordable")) {
    preferences.priceRange = "affordable";
    preferences.hasPreferences = true;
  } else if (allText.includes("premium") || allText.includes("luxury")) {
    preferences.priceRange = "premium";
    preferences.hasPreferences = true;
  }

  return preferences;
};
