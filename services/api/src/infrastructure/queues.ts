import { env } from "../config/env.js";

export interface QueueProviderConfig {
  provider: "bullmq" | "sqs";
  queueName: string;
  awsRegion?: string;
}

export function getQueueConfig(): QueueProviderConfig {
  if (env.QUEUE_PROVIDER === "sqs") {
    return {
      provider: "sqs",
      queueName: env.SQS_QUEUE_NAME,
      awsRegion: env.AWS_REGION
    };
  }

  return {
    provider: "bullmq",
    queueName: env.BULLMQ_QUEUE_NAME
  };
}
