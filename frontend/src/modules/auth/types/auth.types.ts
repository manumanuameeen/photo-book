export interface IAuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      phone: string;
      role: "user" | "admin" | "photographer";
    };
  };
}

export interface ISignupRequest { name: string; email: string; password: string; phone: string; }
export interface ILoginRequest { email: string; password: string; }
export interface IVerifyOtpRequest { email: string; otp: string; }