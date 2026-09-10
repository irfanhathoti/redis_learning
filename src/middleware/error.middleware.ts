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

  const status =
    typeof (error as { status?: unknown }).status === "number"
      ? (error as { status: number }).status
      : 500;

  return res.status(status).json({
    success: false,
    message: status === 500 ? "Internal server error" : "Bad request",
  });
};
