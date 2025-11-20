export interface IOtpService {
  generateOtp(): string;
  getOtpExpire(): Date;
  isOtpValidate(sotredOtp: string, providedOtp: string, expiryDate: Date | undefined): boolean;
}
