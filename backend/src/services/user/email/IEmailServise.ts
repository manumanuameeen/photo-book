export interface IEmailService {
  sendOtp(email: string, otp: string, name: string): Promise<void>;
  sendWelcomeEmail(email: string, name: string): Promise<void>;
  sendResetCode(email: string, otp: string, name: string): Promise<void>;
  sendApprovalEmail(email: string, name: string, message: string): Promise<void>;
  sendRejectionEmail(email: string, name: string, reason: string): Promise<void>;
}
