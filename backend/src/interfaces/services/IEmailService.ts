export interface BookingEmailDetails {
  eventType: string;
  eventDate: Date | string;
  packageDetails?: {
    name?: string;
  };
  location: string;
  depositeRequired: number;
}

export interface IEmailService {
  sendOtp(email: string, otp: string, name: string): Promise<void>;
  sendWelcomeEmail(email: string, name: string): Promise<void>;
  sendResetCode(email: string, otp: string, name: string): Promise<void>;
  sendApprovalEmail(email: string, name: string, message: string): Promise<void>;
  sendRejectionEmail(email: string, name: string, reason: string): Promise<void>;
  sendBookingConfirmation(
    email: string,
    name: string,
    bookingDetails: BookingEmailDetails,
  ): Promise<void>;
  sendMail(
    to: string,
    subject: string,
    text: string,
    html: string,
    attachments?: { filename: string; path?: string; content?: Buffer | string }[],
  ): Promise<void>;
}
