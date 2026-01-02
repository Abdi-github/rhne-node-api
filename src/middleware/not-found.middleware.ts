import type { Request, Response } from "express";
import { sendError } from "@shared/utils/api-response";
import { HttpStatus } from "@shared/constants/http-status";

export const notFoundHandler = (_req: Request, res: Response): void => {
  sendError(
    res,
    HttpStatus.NOT_FOUND,
    `Route ${_req.originalUrl} not found`,
    "ROUTE_NOT_FOUND"
  );
};
