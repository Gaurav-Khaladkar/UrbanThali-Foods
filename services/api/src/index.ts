import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { generateDailyDeliveryTickets } from "./jobs/daily-tickets.job.js";
import { subscriptionRouter } from "./modules/subscriptions/subscription.route.js";
import { healthRouter } from "./routes/health.route.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "UrbanThali API is running",
    generatedTickets: generateDailyDeliveryTickets().count
  });
});

app.use("/health", healthRouter);
app.use("/subscriptions", subscriptionRouter);

app.listen(env.API_PORT, () => {
  // Keep startup log simple for containerized environments.
  // eslint-disable-next-line no-console
  console.log(`UrbanThali API listening on port ${env.API_PORT}`);
});
