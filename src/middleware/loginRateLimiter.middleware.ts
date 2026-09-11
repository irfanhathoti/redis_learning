import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient, { connectRedis } from "../config/redis";

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: async (...args: string[]) => {
      await connectRedis();
      return redisClient.sendCommand(args);
    },
    prefix: "rl:login:",
  }),

  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

export default loginRateLimiter;
