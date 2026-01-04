import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess, sendCreated } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as appointmentService from "./appointment.service";

export const getAppointments = asyncHandler(async (req: Request, res: Response) => {
  const options = parsePaginationQuery(req.query);
  const result = await appointmentService.getAll(
    options,
    req.query.is_active as string | undefined
  );
  sendSuccess(res, "Appointments retrieved successfully", result.data, result.pagination);
});

export const getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await appointmentService.getById(req.params.id);
  sendSuccess(res, "Appointment retrieved successfully", appointment);
});

export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await appointmentService.create(req.body);
  sendCreated(res, "Appointment created successfully", appointment);
});

export const updateAppointment = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await appointmentService.update(req.params.id, req.body);
  sendSuccess(res, "Appointment updated successfully", appointment);
});

export const deleteAppointment = asyncHandler(async (req: Request, res: Response) => {
  await appointmentService.softDelete(req.params.id);
  sendSuccess(res, "Appointment deleted successfully", null);
});
