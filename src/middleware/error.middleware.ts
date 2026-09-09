import { NextFunction, Request, Response } from "express";

import logger from "../utils/logger";

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error("Unhandled application error", {
    // an Error stringifies to {}, so pull the stack out by hand
    error: error instanceof Error ? error.stack || error.message : error,
    method: req.method,
    path: req.originalUrl,
  });

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
