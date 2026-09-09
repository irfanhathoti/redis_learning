import { createClient } from "redis";
import logger from "../utils/logger";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (error) => {
  logger.error("Redis error", {
    error,
  });
});

redisClient.on('ready',()=>{
  logger.info('redis is read.')
})

export const connectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    return;
  }

  await redisClient.connect();

  logger.info("Redis connected successfully");
};

export const disconnectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    return;
  }

  await redisClient.quit();

  logger.info("Redis disconnected");
};

export default redisClient;
