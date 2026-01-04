import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as serviceService from "./service.service";

// GET /api/v1/services
export const getServices = asyncHandler(async (req: Request, res: Response) => {
  const options = parsePaginationQuery(req.query);
  const queryFilters = {
    category: req.query.category as string | undefined,
    site: req.query.site as string | undefined,
  };
  const result = await serviceService.getAllServices(options, queryFilters);
  sendSuccess(res, "Services retrieved successfully", result.data, result.pagination);
});

// GET /api/v1/services/:slug
export const getServiceBySlug = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.getServiceBySlug(req.params.slug);
  sendSuccess(res, "Service retrieved successfully", service);
});
