import { env } from "../config/env.js";

export interface PostgresConfig {
  connectionUrl: string;
}

export function getPostgresConfig(): PostgresConfig {
  return {
    connectionUrl: env.DATABASE_URL
  };
}
