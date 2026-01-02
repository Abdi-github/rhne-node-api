import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@config/env";
import { ApiError } from "@shared/utils/api-error";

interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Access token is required");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw ApiError.unauthorized("Access token is required");
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      next(ApiError.unauthorized("Access token has expired"));
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(ApiError.unauthorized("Invalid access token"));
      return;
    }

    next(ApiError.unauthorized("Authentication failed"));
  }
};
