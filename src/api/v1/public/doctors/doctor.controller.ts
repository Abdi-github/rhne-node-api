import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as doctorService from "./doctor.service";

// GET /api/v1/doctors
export const getDoctors = asyncHandler(async (req: Request, res: Response) => {
  const options = parsePaginationQuery(req.query);
  const queryFilters = {
    service: req.query.service as string | undefined,
  };
  const result = await doctorService.getAllDoctors(options, queryFilters);
  sendSuccess(res, "Doctors retrieved successfully", result.data, result.pagination);
});

// GET /api/v1/doctors/:id
export const getDoctorById = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await doctorService.getDoctorById(req.params.id);
  sendSuccess(res, "Doctor retrieved successfully", doctor);
});
