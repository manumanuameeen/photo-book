export interface CreateRentalItemData {
    name: string;
    category: string;
    condition: string;
    description: string;

    pricePerDay: number;
    securityDeposit: number;
    minRentalPeriod: number;
    images: File[];
}

export interface IUserProfile {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    phone?: string;
    phoneNumber?: string;
}

export interface IRentalItem {
    _id: string;
    name: string;
    category: string;
    condition: string;
    description: string;

    pricePerDay: number;
    securityDeposit: number;
    minRentalPeriod: number;
    images: string[];
    maxRentalPeriod?: number;
    ownerId: string | IUserProfile;
    likes?: string[];
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE' | 'BLOCKED';
    createdAt: string;
    updatedAt: string;
    stock?: number;
    termsAndConditions?: string;
}

export interface IRentalOrder {
    _id: string;
    renterId: IUserProfile;
    items: {
        _id: string;
        name: string;
        category: string;
        images: string[];
        pricePerDay: number;
        ownerId?: string | IUserProfile;
    }[];
    startDate: string;
    endDate: string;
    totalAmount: number;
    taxAmount: number;
    status: 'PENDING' | 'ACCEPTED' | 'WAITING_FOR_DEPOSIT' | 'CONFIRMED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'REJECTED' | 'SHIPPED' | 'DELIVERED' | 'RETURNED';
    paymentMethod: string;
    paymentId?: string;
    idProof?: string;
    amountPaid?: number;
    depositeRequired?: number;
    finalPaymentId?: string;
    paymentSecret?: string;
    rescheduleRequest?: {
        requestedStartDate: string;
        requestedEndDate: string;
        reason: string;
        status: "pending" | "rejected" | "expired" | "approved";
        createdAt: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedResponse<T> {
    items?: T[];
    orders?: T[];
    data?: T[];
    total: number;
    page: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface AvailabilityResponse {
    isAvailable: boolean;
}

export interface UnavailableDate {
    startDate: string;
    endDate: string;
    type: string;
    reason?: string;
}

export interface IRecentActivity {
    _id: string;
    status: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    itemName?: string;
    itemImage?: string;
    renter?: { name: string; email: string; profileImage?: string };
}

export interface IRentalDashboardStats {
    hosting: {
        totalEarnings: number;
        activeRentals: number;
        totalListings: number;
        totalOrders: number;
        monthlyEarnings: { month: string; amount: number; rentalAmount?: number; bookingAmount?: number }[];
        recentActivity: IRecentActivity[];
        totalReviews?: number;
        averageRating?: number;
    };
    renting: {
        totalSpent: number;
        activeRents: number;
        totalOrders: number;
        recentActivity: IRecentActivity[];
        photographerSpending?: number;
        totalWarnings?: number;
        monthlyEquipmentSpent?: { month: string; amount: number }[];
        monthlyPhotographerSpent?: { month: string; amount: number }[];
    };
}

export interface RentItemFormData {
    name: string;
    category: string;
    condition: string;
    description: string;

    pricePerDay: number;
    securityDeposit: number;
    minRentalPeriod: number;
    maxRentalPeriod: number;
    stock: number;
}
