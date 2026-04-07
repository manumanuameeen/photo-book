// Defining interfaces locally to prevent cross-project dependency on frontend
export interface PhotographerData {
  _id: string;
  name: string;
  businessName?: string;
  specialties: string[];
  location: string;
  rating: number;
  reviews: number;
  profileImage: string | null;
}

export interface PackageData {
  _id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  deliveryTime: string;
}

export interface AvailabilityData {
  date: string;
  slots: string[];
}

export type ChatbotPhase = 
  | "GREETING" 
  | "BROWSING" 
  | "COMPARING" 
  | "BOOKING_INITIATED" 
  | "BOOKING_PENDING" 
  | "BOOKING_CONFIRMED";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatbotStructuredData {
  type: 'photographer_list' | 'package_list' | 'booking_confirmation' | 'availability_picker';
  photographerId?: string;
  data?: any[] | any;
  bookingId?: string;
}

export interface ChatbotResult {
  success: boolean;
  message: string;
  structuredData?: ChatbotStructuredData;
  nextPhase: ChatbotPhase;
}

export interface BookingDetails {
  eventDate?: string;
  startTime?: string;
  location?: string;
  eventType?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}
