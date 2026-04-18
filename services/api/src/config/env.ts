import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/urbanthali"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  AWS_REGION: z.string().default("ap-south-1"),
  AWS_S3_BUCKET: z.string().default("urbanthali-assets"),
  AWS_CLOUDFRONT_DOMAIN: z.string().default("cdn.urbanthali.local"),
  QUEUE_PROVIDER: z.enum(["bullmq", "sqs"]).default("bullmq"),
  BULLMQ_QUEUE_NAME: z.string().default("daily-manifest-jobs"),
  SQS_QUEUE_NAME: z.string().default("urbanthali-sqs-jobs"),
  RAZORPAY_KEY_ID: z.string().default("rzp_test_xxxxx"),
  STRIPE_PUBLISHABLE_KEY: z.string().default("pk_test_xxxxx"),
  FIREBASE_PROJECT_ID: z.string().default("urbanthali-notify"),
  FCM_SERVER_KEY: z.string().default("fcm_server_key")
});

export const env = envSchema.parse(process.env);
