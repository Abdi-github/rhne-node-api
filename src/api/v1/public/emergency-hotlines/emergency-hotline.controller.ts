import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as emergencyHotlineService from "./emergency-hotline.service";

export const getEmergencyHotlines = asyncHandler(async (req: Request, res: Response) => {
  const options = parsePaginationQuery(req.query);
  const result = await emergencyHotlineService.getAllEmergencyHotlines(options);
  sendSuccess(res, "Emergency hotlines retrieved successfully", result.data, result.pagination);
});

export const getEmergencyHotlineBySlug = asyncHandler(async (req: Request, res: Response) => {
  const hotline = await emergencyHotlineService.getEmergencyHotlineBySlug(req.params.slug);
  sendSuccess(res, "Emergency hotline retrieved successfully", hotline);
});
