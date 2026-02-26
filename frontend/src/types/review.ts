export interface Review {
    _id: string;
    reviewerId: {
        _id: string;
        name: string;
        email: string;
        profileImage?: string;
    };
    targetId: string;
    type: string;
    rating: number;
    comment: string;
    isVerified?: boolean;
    likes?: string[];
    ownerReply?: {
        comment: string;
        createdAt: string;
    };
    createdAt: string;
    updatedAt?: string;
    edited?: boolean;
}

export interface ReviewUpdatePayload {
    rating?: number;
    comment?: string;
}

export interface ReviewStats {
    average: number;
    count: number;
}
