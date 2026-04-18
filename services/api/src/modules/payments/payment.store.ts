export type PaymentStatus = "created" | "authorized" | "failed";

export interface PaymentRecord {
  id: string;
  amountInr: number;
  currency: "INR";
  method: "card" | "upi" | "netbanking";
  customerEmail: string;
  status: PaymentStatus;
  createdAtIso: string;
}

export const payments: PaymentRecord[] = [];
