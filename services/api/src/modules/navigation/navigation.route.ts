import { Router } from "express";
import { z } from "zod";
import { buildNavigationRoute } from "./navigation.service.js";

const routeSchema = z.object({
  start: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  end: z.object({
    lat: z.number(),
    lng: z.number()
  })
});

export const navigationRouter = Router();

navigationRouter.post("/route", (req, res) => {
  const parsed = routeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid route payload", details: parsed.error.flatten() });
  }

  const route = buildNavigationRoute(parsed.data.start, parsed.data.end);
  return res.status(200).json({
    message: "Navigation route generated",
    data: route
  });
});
