export interface CreatePackageDto {
    name: string;
    description: string;
    price: number;
    editedPhoto: number;
    features: string[];
    deliveryTime: string;
    categoryId: string;
    coverImage?: string;
}

export interface UpdatePackageDto extends Partial<CreatePackageDto> {
    id: string;
    isActive?: boolean;
}

export interface SetAvailabilityDto {
    date: string | Date; 
    slots: Array<{
        startTime: string;
        endTime: string;
        status?: "AVAILABLE" | "BOOKED" | "UNAVAILABLE";
    }>;
    isFullDayAvailable?: boolean;
}
