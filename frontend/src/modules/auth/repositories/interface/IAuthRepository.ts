import type { IAuthResponse,IForgetPassword,ILoginRequest,IResetPassword,ISignupRequest,IVerifyOtpRequest, IVerifyResetOtp } from "../../types/auth.types";
export interface IAuthRespository {
  signup(data: ISignupRequest): Promise<IAuthResponse>;
  verifyOtp(data: IVerifyOtpRequest): Promise<IAuthResponse>;
  login(data: ILoginRequest): Promise<IAuthResponse>;
  resendOtp(email:string):Promise<{message:string}>;
  logout():Promise<{message:string}>;
  forgetPassword(data:IForgetPassword):Promise<{message:string}>;
  verifyResetOtp(data:IVerifyResetOtp):Promise<{message:string}>;
  resetPassword(data:IResetPassword):Promise<{message:string}>;
  }
