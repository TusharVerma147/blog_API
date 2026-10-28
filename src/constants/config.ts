import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI || "",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  dbName: "blog_user",
} as const;

if (!config.mongoUri) {
  throw new Error("MONGODB_URI is required in the .env file");
}

if (!config.redisUrl) {
  throw new Error("REDIS_URL is required in the .env file");
}
