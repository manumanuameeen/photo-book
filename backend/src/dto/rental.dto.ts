export interface CreateRentalItemDTO {
  name: string;
  description: string;
  category: string;
  pricePerDay: number;
  securityDeposit: number;
  minRentalPeriod: number;
  location: string;
  features: string[];
  images?: string[];
  ownerId?: string;
}

export interface UpdateRentalItemDTO {
  name?: string;
  description?: string;
  category?: string;
  pricePerDay?: number;
  securityDeposit?: number;
  minRentalPeriod?: number;
  location?: string;
  features?: string[];
  images?: string[];
  existingImages?: string[] | string;
}

export interface RentItemDTO {
  itemIds: string | string[];
  startDate: string | Date;
  endDate: string | Date;
  paymentIntentId?: string;
  paymentMethod: "wallet" | "stripe";
}

export interface BlockDatesDTO {
  startDate: string | Date;
  endDate: string | Date;
  reason?: string;
}
