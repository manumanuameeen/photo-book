export interface IEmailService {
  sendOtp(email: string, otp: string, name: string): Promise<void>;
  sendWelcomeEmail(email: string, name: string): Promise<void>;
  sendResetCode(email: string, otp: string, name: string): Promise<void>;
}
