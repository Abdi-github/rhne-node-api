import { HttpStatus } from "@shared/constants/http-status";

export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details: unknown[];
  public isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    code: string = "ERROR",
    details: unknown[] = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, details: unknown[] = []): ApiError {
    return new ApiError(HttpStatus.BAD_REQUEST, message, "BAD_REQUEST", details);
  }

  static unauthorized(message = "Unauthorized"): ApiError {
    return new ApiError(HttpStatus.UNAUTHORIZED, message, "UNAUTHORIZED");
  }

  static forbidden(message = "Access denied"): ApiError {
    return new ApiError(HttpStatus.FORBIDDEN, message, "FORBIDDEN");
  }

  static notFound(resource = "Resource"): ApiError {
    return new ApiError(HttpStatus.NOT_FOUND, `${resource} not found`, "NOT_FOUND");
  }

  static conflict(message: string): ApiError {
    return new ApiError(HttpStatus.CONFLICT, message, "CONFLICT");
  }

  static internal(message = "Internal server error"): ApiError {
    return new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, message, "INTERNAL_SERVER_ERROR");
  }

  static tooManyRequests(message = "Too many requests"): ApiError {
    return new ApiError(HttpStatus.TOO_MANY_REQUESTS, message, "TOO_MANY_REQUESTS");
  }
}
