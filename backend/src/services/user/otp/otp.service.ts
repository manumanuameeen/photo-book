import { randomInt } from "crypto";
import type { IOtpService } from "./IOtpservice.ts";

export class OtpService implements IOtpService {
  private readonly _OTP_LENGTH = 6;
  private readonly _OTP_EXPIRY_TIME = 2;

  generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }
  getOtpExpire(): Date {
    return new Date(Date.now() + this._OTP_EXPIRY_TIME * 60 * 1000);
  }

  isOtpValidate(storedOtp: string, providedOtp: string, expiry?: Date): boolean {
    if (!storedOtp || !providedOtp) return false;
    if (providedOtp.length !== this._OTP_LENGTH) return false;
    if (storedOtp !== providedOtp) return false;
    if (expiry && new Date(expiry) < new Date()) return false;
    return true;
  }
}
