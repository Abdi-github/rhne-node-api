import type { Request, Response, NextFunction } from "express";
import { ApiError } from "@shared/utils/api-error";
import { sendError } from "@shared/utils/api-response";
import { HttpStatus } from "@shared/constants/http-status";
import { logger } from "@shared/utils/logger";
import { env } from "@config/env";
import mongoose from "mongoose";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ApiError (operational)
  if (err instanceof ApiError) {
    sendError(res, err.statusCode, err.message, err.code, err.details);
    return;
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    sendError(res, HttpStatus.BAD_REQUEST, "Validation error", "VALIDATION_ERROR", details);
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    sendError(res, HttpStatus.BAD_REQUEST, `Invalid ${err.path}: ${err.value}`, "CAST_ERROR");
    return;
  }

  // Mongoose duplicate key error
  if (isDuplicateKeyError(err)) {
    const field = Object.keys((err as MongoServerError).keyValue || {})[0] || "field";
    sendError(res, HttpStatus.CONFLICT, `Duplicate value for: ${field}`, "DUPLICATE_KEY");
    return;
  }

  // Unknown error
  logger.error("Unhandled error:", err);
  const message = env.NODE_ENV === "development" ? err.message : "Internal server error";
  sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, message, "INTERNAL_SERVER_ERROR");
};

interface MongoServerError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

function isDuplicateKeyError(err: Error): boolean {
  return (err as MongoServerError).code === 11000;
}
