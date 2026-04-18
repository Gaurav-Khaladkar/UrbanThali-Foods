export interface OtpRecord {
  phone: string;
  otp: string;
  issuedAtIso: string;
}

export const otpStore: OtpRecord[] = [];
