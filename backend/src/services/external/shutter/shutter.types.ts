import { PhotographerData, PackageData, AvailabilityData } from "../../../../frontend/src/components/common/ChatRenderers";

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
