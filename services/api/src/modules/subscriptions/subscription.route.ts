import { Router } from "express";
import { z } from "zod";
import { createSubscription, listSubscriptions } from "./subscription.service.js";

const createSubscriptionSchema = z.object({
  customerId: z.string().min(1),
  planCode: z.string().min(1),
  mealPreference: z.enum(["veg", "non_veg", "jain", "keto"]),
  startDateIso: z.string().datetime()
});

export const subscriptionRouter = Router();

subscriptionRouter.get("/", (_req, res) => {
  res.status(200).json({ data: listSubscriptions() });
});

subscriptionRouter.post("/", (req, res) => {
  const parsed = createSubscriptionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid payload",
      details: parsed.error.flatten()
    });
  }

  const subscription = createSubscription(parsed.data);
  return res.status(201).json({ data: subscription });
});
