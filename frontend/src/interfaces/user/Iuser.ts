export interface IUser {
  id: string; 
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | "photographer";
  status?: 'active' | 'blocked'; 
  walletBalance: number;
  bio?: string;
  location?: string;
  lat?: number;
  lng?: number;
  profileImage?: string;
  applicationStatus?: "PENDING" | "APPROVED" | "REJECTED" | "NONE";
  createdAt?: string; 
  updatedAt?: string;
}
