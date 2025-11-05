export interface IEmailservice {
  sendOtp(email: string, otp: string, name: string): Promise<void>;
  sendWelcomeEmail(email: string, name: string): Promise<void>;
}
