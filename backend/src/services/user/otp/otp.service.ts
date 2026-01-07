import { randomInt } from "crypto";
import type { IOtpService } from "./IOtpservice";

export class OtpService implements IOtpService {
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_TIME = 2;

  generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }
  getOtpExpire(): Date {
    return new Date(Date.now() + this.OTP_EXPIRY_TIME * 60 * 1000);
  }

  isOtpValidate(storedOtp: string, providedOtp: string, expiry?: Date): boolean {
    if (!storedOtp || !providedOtp) return false;
    if (providedOtp.length !== this.OTP_LENGTH) return false;
    if (storedOtp !== providedOtp) return false;
    if (expiry && expiry < new Date()) return false;
    return true;
  }
}
