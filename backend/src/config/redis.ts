import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const finalUrl = redisUrl.startsWith("redis://") ? redisUrl : `redis://${redisUrl}`;

const redisClient = createClient({
  url: finalUrl,
});

redisClient.on("connect", () => console.log("✅ Redis connected successfully"));
redisClient.on("error", (err: Error) => console.error("❌ Redis connection error:", err));

redisClient.connect().catch((err) => {
  console.log("Redis connection error prevented crash:", err.message);
});

export default redisClient;
