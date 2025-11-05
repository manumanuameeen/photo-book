import { randomInt } from "crypto";
import type { IOtpservice } from "./IOtpservice";

export class Otpservice implements IOtpservice {
  private readonly OPT_LENGTH = 6;
  private readonly OTP_EXPIRY_TIME = 2;

  generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }
  getOtpExpire(): Date {
    return new Date(Date.now() + this.OTP_EXPIRY_TIME * 60 * 1000);
  }
  isOtpValidate(sotredOtp: string, providedOtp: string, expiryDate: Date | undefined): boolean {
    if (sotredOtp !== providedOtp) {
      return false;
    }
    if (!expiryDate) {
      return false;
    }
    if (expiryDate < new Date()) {
      return false;
    }
    if (providedOtp.length !== this.OPT_LENGTH) {
      return false;
    }
    return true;
  }
}
