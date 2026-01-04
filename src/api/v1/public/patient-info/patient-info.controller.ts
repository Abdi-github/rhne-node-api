import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as patientInfoService from "./patient-info.service";

// GET /api/v1/patient-info
export const getPatientInfo = asyncHandler(async (req: Request, res: Response) => {
  const options = parsePaginationQuery(req.query);
  const queryFilters = {
    section: req.query.section as string | undefined,
  };
  const result = await patientInfoService.getAllPatientInfo(options, queryFilters);
  sendSuccess(res, "Patient info retrieved successfully", result.data, result.pagination);
});

// GET /api/v1/patient-info/:slug
export const getPatientInfoBySlug = asyncHandler(async (req: Request, res: Response) => {
  const info = await patientInfoService.getPatientInfoBySlug(req.params.slug);
  sendSuccess(res, "Patient info page retrieved successfully", info);
});
