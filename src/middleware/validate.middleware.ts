import type { Request, Response, NextFunction } from "express";
import type { AnyZodObject, ZodError } from "zod";
import { ApiError } from "@shared/utils/api-error";

export const validate =
  (schema: AnyZodObject) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      const zodError = error as ZodError;
      const details = zodError.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      next(ApiError.badRequest("Validation error", details));
    }
  };
