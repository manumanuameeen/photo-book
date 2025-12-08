export interface IUserResponse {
    name: string;
    email: string;
    phone: string;
    role: "user" | "admin" | "photographer";
    walletBalance: number;
    bio?: string;
    location?: string;
    lat?: number;
    lng?: number;
    applicationStatus?: "PENDING" | "APPROVED" | "REJECTED" | "NONE";
    createdAt: string;
}




export interface IProfileResponse {
    success: boolean;
    message: string;
    data: IUserResponse
}

export interface IUpdateProfile {
    name?: string;
    phone?: string;
    bio?: string;
    location?: string;
    lat?: number | null;
    lng?: number | null;
}


export interface IChangePassword {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface IPasswordResponse {
    success: boolean;
    message: string;
}