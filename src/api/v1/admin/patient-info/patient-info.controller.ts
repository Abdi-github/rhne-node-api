import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess, sendCreated } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as patientInfoService from "./patient-info.service";

export const getPatientInfoPages = asyncHandler(async (req: Request, res: Response) => {
  const options = parsePaginationQuery(req.query);
  const result = await patientInfoService.getAll(options, req.query.section as string | undefined);
  sendSuccess(res, "Patient info pages retrieved successfully", result.data, result.pagination);
});

export const getPatientInfoById = asyncHandler(async (req: Request, res: Response) => {
  const info = await patientInfoService.getById(req.params.id);
  sendSuccess(res, "Patient info page retrieved successfully", info);
});

export const createPatientInfo = asyncHandler(async (req: Request, res: Response) => {
  const info = await patientInfoService.create(req.body);
  sendCreated(res, "Patient info page created successfully", info);
});

export const updatePatientInfo = asyncHandler(async (req: Request, res: Response) => {
  const info = await patientInfoService.update(req.params.id, req.body);
  sendSuccess(res, "Patient info page updated successfully", info);
});

export const deletePatientInfo = asyncHandler(async (req: Request, res: Response) => {
  await patientInfoService.remove(req.params.id);
  sendSuccess(res, "Patient info page deleted successfully", null);
});
