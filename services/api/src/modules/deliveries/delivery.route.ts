import { Router } from "express";
import { z } from "zod";
import { createDelivery, getDeliveryTracking, listDeliveries, updateDeliveryStatus } from "./delivery.service.js";

const locationSchema = z.object({
  lat: z.number(),
  lng: z.number()
});

const createDeliverySchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  address: z.string().min(5),
  riderName: z.string().min(2),
  start: locationSchema,
  end: locationSchema
});

const statusSchema = z.object({
  status: z.enum(["assigned", "picked_up", "in_transit", "delivered", "failed"])
});

export const deliveryRouter = Router();

deliveryRouter.post("/", (req, res) => {
  const parsed = createDeliverySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid delivery payload", details: parsed.error.flatten() });
  }

  const delivery = createDelivery(parsed.data);
  return res.status(201).json({
    message: "Delivery created",
    data: delivery
  });
});

deliveryRouter.get("/", (_req, res) => {
  res.status(200).json({ data: listDeliveries() });
});

deliveryRouter.patch("/:deliveryId/status", (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid delivery status payload", details: parsed.error.flatten() });
  }

  try {
    const delivery = updateDeliveryStatus(req.params.deliveryId, parsed.data.status);
    return res.status(200).json({ message: "Delivery status updated", data: delivery });
  } catch (error) {
    return res.status(404).json({ error: error instanceof Error ? error.message : "Delivery not found" });
  }
});

deliveryRouter.get("/:deliveryId/tracking", (req, res) => {
  try {
    const tracking = getDeliveryTracking(req.params.deliveryId);
    return res.status(200).json({ data: tracking });
  } catch (error) {
    return res.status(404).json({ error: error instanceof Error ? error.message : "Tracking not found" });
  }
});
