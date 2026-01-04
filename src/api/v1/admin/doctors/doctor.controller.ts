import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess, sendCreated } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as doctorService from "./doctor.service";

export const getDoctors = asyncHandler(async (req: Request, res: Response) => {
  const options = parsePaginationQuery(req.query);
  const result = await doctorService.getAll(options, req.query.is_active as string | undefined);
  sendSuccess(res, "Doctors retrieved successfully", result.data, result.pagination);
});

export const getDoctorById = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await doctorService.getById(req.params.id);
  sendSuccess(res, "Doctor retrieved successfully", doctor);
});

export const createDoctor = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await doctorService.create(req.body);
  sendCreated(res, "Doctor created successfully", doctor);
});

export const updateDoctor = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await doctorService.update(req.params.id, req.body);
  sendSuccess(res, "Doctor updated successfully", doctor);
});

export const deleteDoctor = asyncHandler(async (req: Request, res: Response) => {
  await doctorService.softDelete(req.params.id);
  sendSuccess(res, "Doctor deleted successfully", null);
});
