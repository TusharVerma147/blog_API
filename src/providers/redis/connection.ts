import Redis from "ioredis";
import { config } from "../../constants/config";

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    throw new Error("Redis has not been connected yet");
  }
  return redisClient;
}

export async function connectRedis(): Promise<Redis> {
  if (redisClient) {
    return redisClient;
  }

  const client = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    lazyConnect: true,
  });

  // Never crash the process on Redis errors after startup
  client.on("error", (error) => {
    console.error("Redis error:", error.message);
  });

  console.log(`[Redis] Connecting to ${config.redisUrl} ...`);
  await client.connect();
  await client.ping();

  redisClient = client;
  console.log("[Redis] Connected successfully");

  return redisClient;
}
