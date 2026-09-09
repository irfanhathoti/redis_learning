import "dotenv/config";

import express from "express";

import logger from "./utils/logger";
import databaseConnect, { disconnectDatabase } from "./config/mongodb";
import { connectRedis, disconnectRedis } from "./config/redis";
import sessionMiddleWare from "./config/session";
import authRoutes from "./routers/auth.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

app.use(express.json());

app.use(sessionMiddleWare);

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/auth", authRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

app.use(errorHandler);

const startServer = async () => {
  try {
    await databaseConnect();
    await connectRedis();

    const server = app.listen(PORT, () => {
      logger.info(`App listening on port ${PORT}`, {
        status: "Success",
        environment: process.env.NODE_ENV || "development",
      });
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown`);

      server.close(async () => {
        logger.info("HTTP server closed");

        await disconnectDatabase();
        await disconnectRedis();

        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error("Application failed to start", {
      error,
    });

    process.exit(1);
  }
};

startServer();
