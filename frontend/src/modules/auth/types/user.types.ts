export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface IAuthResponse{
    user:IUser;
    accessToken?:string;
}

export interface ISignupRequest{
   name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ILoginRequest{
   email: string;
  password: string;
}

export interface IVerifyOtpRequest{
   email: string;
  otp: string;
}

