import mongoose from "mongoose";
import logger from "../utils/logger";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

let retryCount = 0;

const databaseConnect = async (): Promise<void> => {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    logger.error("MONGO_URL is not defined in environment variables");
    process.exit(1);
  }

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20,
      minPoolSize: 2,
    });

    retryCount = 0;

    logger.info("MongoDB connected successfully", {
      status: "Success",
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      readyState: mongoose.connection.readyState,
    });
  } catch (error) {
    retryCount++;

    logger.error("MongoDB connection failed", {
      status: "Failed",
      retryAttempt: retryCount,
      error,
    });

    if (retryCount >= MAX_RETRIES) {
      logger.error("Maximum MongoDB connection retries reached");

      process.exit(1);
    }

    logger.warn(`Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000}s`);

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));

    return databaseConnect();
  }
};

mongoose.connection.on("connected", () => {
  logger.info("MongoDB connection established");
});

mongoose.connection.on("error", (error) => {
  logger.error("MongoDB connection error", {
    error,
  });
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected");
});

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();

    logger.info("MongoDB connection closed gracefully");
  } catch (error) {
    logger.error("Error while closing MongoDB connection", {
      error,
    });
  }
};

export default databaseConnect;
