export interface ISignupPayload {
    name: string;
    email: string;
    phone: string;
    password: string;
}

export interface ILoginPayload{
    email:string;
    password:string;
}

export interface IVerifyOtpPayload{
    email:string;
    otp:string
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | "photorapher"; 
  status: 'active' | 'blocked';
  walletBalance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAuthResponse{
    user:IUser;
    accessToken?:string;
}