import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",

  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(
      ({ timestamp, level, message, stack, ...metadata }) => {
        const meta =
          Object.keys(metadata).length > 0
            ? ` ${JSON.stringify(metadata)}`
            : "";

        return `${timestamp} [${level.toUpperCase()}]: ${
          stack || message
        }${meta}`;
      },
    ),
  ),

  transports: [new winston.transports.Console()],
});

export default logger;
