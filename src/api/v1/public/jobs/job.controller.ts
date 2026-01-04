import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as jobService from "./job.service";

// GET /api/v1/jobs
export const getJobs = asyncHandler(async (req: Request, res: Response) => {
  const options = parsePaginationQuery(req.query);
  const queryFilters = {
    category: req.query.category as string | undefined,
    site: req.query.site as string | undefined,
  };
  const result = await jobService.getAllJobs(options, queryFilters);
  sendSuccess(res, "Jobs retrieved successfully", result.data, result.pagination);
});

// GET /api/v1/jobs/:id
export const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.getJobById(req.params.id);
  sendSuccess(res, "Job retrieved successfully", job);
});
