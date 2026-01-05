import type { Response } from "express";
import { HttpStatus } from "@shared/constants/http-status";
import type { PaginationResult } from "@shared/types/common.types";

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data: T,
  pagination?: PaginationResult,
  statusCode: number = HttpStatus.OK
): void => {
  const response: Record<string, unknown> = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  res.status(statusCode).json(response);
};

export const sendCreated = <T>(
  res: Response,
  message: string,
  data: T
): void => {
  sendSuccess(res, message, data, undefined, HttpStatus.CREATED);
};

export const sendNoContent = (res: Response): void => {
  res.status(HttpStatus.NO_CONTENT).send();
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  code: string = "ERROR",
  details: unknown[] = []
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      details,
    },
  });
};
