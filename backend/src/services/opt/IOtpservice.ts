export interface IOtpservice {
  generateOtp(): string;
  getOtpExpire(): Date;
  isOtpValidate(sotredOtp: string, providedOtp: string, expiryDate: Date | undefined): boolean;
}
