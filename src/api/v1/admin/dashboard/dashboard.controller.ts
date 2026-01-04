import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess } from "@shared/utils/api-response";
import * as dashboardService from "./dashboard.service";

// GET /api/v1/admin/dashboard/stats
export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await dashboardService.getDashboardStats();
  sendSuccess(res, "Dashboard stats retrieved successfully", stats);
});
