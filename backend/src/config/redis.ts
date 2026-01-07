import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("connect", () => console.log("✅ Redis connected successfully"));
redisClient.on("error", (err: Error) => console.error("❌ Redis connection error:", err));

redisClient.connect().catch((err) => {
  console.log("Redis connection error prevented crash:", err.message);
});

export default redisClient;
