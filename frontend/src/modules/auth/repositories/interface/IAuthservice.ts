import type { IAuthResponse,ILoginRequest,ISignupRequest,IVerifyOtpRequest } from "../../types/auth.types";
export interface IAuthService {
  signup(data: ISignupRequest): Promise<IAuthResponse>;
  verifyOtp(data: IVerifyOtpRequest): Promise<IAuthResponse>;
  login(data: ILoginRequest): Promise<IAuthResponse>;
}