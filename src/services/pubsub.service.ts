import redisClient from "../config/redis";
import logger from "../utils/logger";

const publisher = redisClient;

const subscriber = redisClient.duplicate();

// duplicate() doesn't copy listeners, and an unhandled "error" event kills the process
subscriber.on("error", (error) => {
  logger.error("Redis subscriber error", { error });
});

export const connectSubscriber = async () => {
  if (!subscriber.isOpen) {
    await subscriber.connect();
  }
  logger.info("Redis subscriber connected...");
};

export const subscribeToNotifications = async () => {
  await subscriber.subscribe("notifications", (message) => {
    logger.info("Notification received", {
      message,
    });
  });
};

export const publishNotification = async (message: string) => {
  await publisher.publish("notifications", message);
};
