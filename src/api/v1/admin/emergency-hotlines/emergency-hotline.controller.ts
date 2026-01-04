import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess, sendCreated } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as emergencyHotlineService from "./emergency-hotline.service";

export const getEmergencyHotlines = asyncHandler(async (req: Request, res: Response) => {
  const options = parsePaginationQuery(req.query);
  const result = await emergencyHotlineService.getAll(
    options,
    req.query.is_active as string | undefined
  );
  sendSuccess(res, "Emergency hotlines retrieved successfully", result.data, result.pagination);
});

export const getEmergencyHotlineById = asyncHandler(async (req: Request, res: Response) => {
  const hotline = await emergencyHotlineService.getById(req.params.id);
  sendSuccess(res, "Emergency hotline retrieved successfully", hotline);
});

export const createEmergencyHotline = asyncHandler(async (req: Request, res: Response) => {
  const hotline = await emergencyHotlineService.create(req.body);
  sendCreated(res, "Emergency hotline created successfully", hotline);
});

export const updateEmergencyHotline = asyncHandler(async (req: Request, res: Response) => {
  const hotline = await emergencyHotlineService.update(req.params.id, req.body);
  sendSuccess(res, "Emergency hotline updated successfully", hotline);
});

export const deleteEmergencyHotline = asyncHandler(async (req: Request, res: Response) => {
  await emergencyHotlineService.softDelete(req.params.id);
  sendSuccess(res, "Emergency hotline deleted successfully", null);
});
