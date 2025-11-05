import type{ IAuthResponse } from "../modules/auth/types/auth.types";
import type{ ILoginPayload } from "../modules/auth/types/auth.types";
import type{ ISignupPayload } from "../modules/auth/types/auth.types";
import type{ IVerifyOtpPayload } from "../modules/auth/types/auth.types";

export  interface IAuthServise{
   signup(data:ISignupPayload):Promise<IAuthResponse>;
   verifyOtp(data:IVerifyOtpPayload):Promise<IAuthResponse>;
   login(data:ILoginPayload):Promise<IAuthResponse>;
}

