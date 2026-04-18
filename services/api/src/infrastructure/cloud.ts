import { env } from "../config/env.js";

export interface AwsRuntimeConfig {
  region: string;
  s3Bucket: string;
  cloudFrontDomain: string;
}

export function getAwsConfig(): AwsRuntimeConfig {
  return {
    region: env.AWS_REGION,
    s3Bucket: env.AWS_S3_BUCKET,
    cloudFrontDomain: env.AWS_CLOUDFRONT_DOMAIN
  };
}
