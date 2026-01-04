import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as siteService from "./site.service";

// GET /api/v1/sites
export const getSites = asyncHandler(async (req: Request, res: Response) => {
  const options = parsePaginationQuery(req.query);
  const result = await siteService.getAllSites(options);
  sendSuccess(res, "Sites retrieved successfully", result.data, result.pagination);
});

// GET /api/v1/sites/:slug
export const getSiteBySlug = asyncHandler(async (req: Request, res: Response) => {
  const site = await siteService.getSiteBySlug(req.params.slug);
  sendSuccess(res, "Site retrieved successfully", site);
});
