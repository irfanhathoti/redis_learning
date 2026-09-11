import { NextFunction, Request, Response } from "express";

import logger from "../utils/logger";

// mounted ahead of the rate limiter so 429s are logged too
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const line = `${req.method} ${req.originalUrl} ${res.statusCode}`;
    const meta = {
      ms: Number(ms.toFixed(1)),
      ip: req.ip,
      // tells Postman, a browser and a script apart
      userAgent: req.get("user-agent"),
      rateLimitRemaining: res.getHeader("RateLimit-Remaining"),
    };

    if (res.statusCode >= 500) logger.error(line, meta);
    else if (res.statusCode === 429) logger.warn(line, meta);
    else logger.info(line, meta);
  });

  next();
};
