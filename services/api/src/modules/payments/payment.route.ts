import { Router } from "express";
import { z } from "zod";
import { confirmPayment, createPaymentIntent, listPayments } from "./payment.service.js";

const createPaymentSchema = z.object({
  amountInr: z.number().positive(),
  method: z.enum(["card", "upi", "netbanking"]),
  customerEmail: z.string().email()
});

const confirmPaymentSchema = z.object({
  paymentId: z.string().min(1),
  otp: z.string().min(4).max(6)
});

export const paymentRouter = Router();

paymentRouter.post("/create-intent", (req, res) => {
  const parsed = createPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payment payload", details: parsed.error.flatten() });
  }

  const payment = createPaymentIntent(parsed.data);
  return res.status(201).json({
    message: "Payment intent created",
    data: {
      ...payment,
      gateway: "sandbox-gateway"
    }
  });
});

paymentRouter.post("/confirm", (req, res) => {
  const parsed = confirmPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid confirmation payload", details: parsed.error.flatten() });
  }

  try {
    const payment = confirmPayment(parsed.data.paymentId, parsed.data.otp);
    return res.status(200).json({
      message: payment.status === "authorized" ? "Payment authorized" : "Payment failed",
      data: payment
    });
  } catch (error) {
    return res.status(404).json({ error: error instanceof Error ? error.message : "Payment confirmation failed" });
  }
});

paymentRouter.get("/", (_req, res) => {
  res.status(200).json({ data: listPayments() });
});
