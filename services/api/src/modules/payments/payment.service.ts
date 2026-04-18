import { randomUUID } from "node:crypto";
import { type PaymentRecord, payments } from "./payment.store.js";

export interface CreatePaymentInput {
  amountInr: number;
  method: "card" | "upi" | "netbanking";
  customerEmail: string;
}

export function createPaymentIntent(input: CreatePaymentInput): PaymentRecord {
  const payment: PaymentRecord = {
    id: randomUUID(),
    amountInr: input.amountInr,
    currency: "INR",
    method: input.method,
    customerEmail: input.customerEmail.toLowerCase(),
    status: "created",
    createdAtIso: new Date().toISOString()
  };

  payments.push(payment);
  return payment;
}

export function confirmPayment(paymentId: string, otp: string): PaymentRecord {
  const payment = payments.find((item) => item.id === paymentId);
  if (!payment) {
    throw new Error("Payment not found");
  }

  payment.status = otp === "1234" ? "authorized" : "failed";
  return payment;
}

export function listPayments(): PaymentRecord[] {
  return payments;
}
