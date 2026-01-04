import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess, sendCreated } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as siteService from "./site.service";

export const getSites = asyncHandler(async (req: Request, res: Response) => {
  const options = parsePaginationQuery(req.query);
  const result = await siteService.getAll(options, req.query.is_active as string | undefined);
  sendSuccess(res, "Sites retrieved successfully", result.data, result.pagination);
});

export const getSiteById = asyncHandler(async (req: Request, res: Response) => {
  const site = await siteService.getById(req.params.id);
  sendSuccess(res, "Site retrieved successfully", site);
});

export const createSite = asyncHandler(async (req: Request, res: Response) => {
  const site = await siteService.create(req.body);
  sendCreated(res, "Site created successfully", site);
});

export const updateSite = asyncHandler(async (req: Request, res: Response) => {
  const site = await siteService.update(req.params.id, req.body);
  sendSuccess(res, "Site updated successfully", site);
});

export const deleteSite = asyncHandler(async (req: Request, res: Response) => {
  await siteService.softDelete(req.params.id);
  sendSuccess(res, "Site deleted successfully", null);
});
