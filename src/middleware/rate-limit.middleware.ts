import rateLimit from "express-rate-limit";
import { env } from "@config/env";
import { sendError } from "@shared/utils/api-response";
import { HttpStatus } from "@shared/constants/http-status";

export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      HttpStatus.TOO_MANY_REQUESTS,
      "Too many requests, please try again later",
      "RATE_LIMIT_EXCEEDED"
    );
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      HttpStatus.TOO_MANY_REQUESTS,
      "Too many auth attempts, please try again later",
      "RATE_LIMIT_EXCEEDED"
    );
  },
});
