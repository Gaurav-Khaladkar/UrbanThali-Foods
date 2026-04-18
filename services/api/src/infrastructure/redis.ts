import { env } from "../config/env.js";

export interface RedisConfig {
  connectionUrl: string;
}

export function getRedisConfig(): RedisConfig {
  return {
    connectionUrl: env.REDIS_URL
  };
}
