import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient, { connectRedis } from "../config/redis";

const apiRateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: true,
  store: new RedisStore({
    sendCommand: async (...args: string[]) => {
      await connectRedis();
      return redisClient.sendCommand(args);
    },
    prefix: "rl:api:",
  }),
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

export default apiRateLimiter;
