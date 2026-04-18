import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { getAwsConfig } from "./infrastructure/cloud.js";
import { getPostgresConfig } from "./infrastructure/postgres.js";
import { getQueueConfig } from "./infrastructure/queues.js";
import { getRedisConfig } from "./infrastructure/redis.js";
import { generateDailyDeliveryTickets } from "./jobs/daily-tickets.job.js";
import { authRouter } from "./modules/auth/auth.route.js";
import { deliveryRouter } from "./modules/deliveries/delivery.route.js";
import { navigationRouter } from "./modules/navigation/navigation.route.js";
import { notificationRouter } from "./modules/notifications/notification.route.js";
import { paymentRouter } from "./modules/payments/payment.route.js";
import { subscriptionRouter } from "./modules/subscriptions/subscription.route.js";
import { healthRouter } from "./routes/health.route.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "UrbanThali professional platform API is running",
    generatedTickets: generateDailyDeliveryTickets().count,
    stack: {
      backend: "Node.js + Express + TypeScript",
      database: getPostgresConfig(),
      cache: getRedisConfig(),
      queue: getQueueConfig(),
      cloud: getAwsConfig(),
      payments: ["Razorpay (primary)", "Stripe (optional)"],
      maps: "Google Maps compatible route APIs",
      auth: "Admin registration + login + OTP verification endpoints"
    }
  });
});

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/payments", paymentRouter);
app.use("/navigation", navigationRouter);
app.use("/deliveries", deliveryRouter);
app.use("/notifications", notificationRouter);
app.use("/subscriptions", subscriptionRouter);

app.listen(env.API_PORT, () => {
  // Keep startup log simple for containerized environments.
  // eslint-disable-next-line no-console
  console.log(`UrbanThali API listening on port ${env.API_PORT}`);
});
