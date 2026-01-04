import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess, sendCreated } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as jobService from "./job.service";

export const getJobs = asyncHandler(async (req: Request, res: Response) => {
  const options = parsePaginationQuery(req.query);
  const result = await jobService.getAll(options, req.query.is_active as string | undefined);
  sendSuccess(res, "Jobs retrieved successfully", result.data, result.pagination);
});

export const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.getById(req.params.id);
  sendSuccess(res, "Job retrieved successfully", job);
});

export const createJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.create(req.body);
  sendCreated(res, "Job created successfully", job);
});

export const updateJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.update(req.params.id, req.body);
  sendSuccess(res, "Job updated successfully", job);
});

export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
  await jobService.softDelete(req.params.id);
  sendSuccess(res, "Job deleted successfully", null);
});
