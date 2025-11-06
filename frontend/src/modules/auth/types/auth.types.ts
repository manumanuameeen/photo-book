
import type { IUser } from "./user.types";
export interface IAuthResponse {
  user: IUser;
  accessToken?: string; 
  refreshToken?: string;
}

export interface ISignupRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IVerifyOtpRequest {
  email: string;
  otp: string;
}
