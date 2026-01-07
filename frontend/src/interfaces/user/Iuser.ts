export interface IUser {
  id: string; // Changed from _id to match DTO usually, or keep both if unsure, but DTO uses id
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | "photographer";
  status?: 'active' | 'blocked'; // made optional as it might not be in profile response
  walletBalance: number;
  bio?: string;
  location?: string;
  lat?: number;
  lng?: number;
  profileImage?: string;
  applicationStatus?: "PENDING" | "APPROVED" | "REJECTED" | "NONE";
  createdAt?: string; // Date comes as string usually in JSON
  updatedAt?: string;
}
