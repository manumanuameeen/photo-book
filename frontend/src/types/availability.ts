export interface IAvailabilitySlot {
    startTime: string;
    endTime: string;
    status: "AVAILABLE" | "BOOKED" | "UNAVAILABLE";
}

export interface IAvailability {
    _id: string;
    photographer: string;
    date: string;
    slots: IAvailabilitySlot[];
    isFullDayAvailable: boolean;
    createdAt?: string;
    updatedAt?: string;
}
