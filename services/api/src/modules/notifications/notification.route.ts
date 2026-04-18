import { Router } from "express";
import { z } from "zod";
import { otpStore } from "./notification.store.js";

const sendOtpSchema = z.object({
  phone: z.string().min(8)
});

const verifyOtpSchema = z.object({
  phone: z.string().min(8),
  otp: z.string().min(4).max(6)
});

export const notificationRouter = Router();

notificationRouter.post("/send-otp", (req, res) => {
  const parsed = sendOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid OTP request payload", details: parsed.error.flatten() });
  }

  const otp = "1234";
  otpStore.push({
    phone: parsed.data.phone,
    otp,
    issuedAtIso: new Date().toISOString()
  });

  return res.status(200).json({
    message: "OTP issued (firebase/twilio style mock)",
    data: {
      phone: parsed.data.phone,
      otp
    }
  });
});

notificationRouter.post("/verify-otp", (req, res) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid OTP verify payload", details: parsed.error.flatten() });
  }

  const isValid = otpStore.some((record) => record.phone === parsed.data.phone && record.otp === parsed.data.otp);
  return res.status(200).json({
    message: isValid ? "OTP verified" : "OTP invalid",
    data: { valid: isValid }
  });
});
