import { promises } from "dns";

export interface IEmailservice {
  sendOtp(email: string, otp: string, name: string): Promise<void>;
  sendWelcomeEmail(email: string, name: string): Promise<void>;
  sendResetCode(email:string,otp:string,name:string):Promise<void>;
}
