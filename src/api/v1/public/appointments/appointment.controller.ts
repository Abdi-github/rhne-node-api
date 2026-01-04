import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as appointmentService from "./appointment.service";

export const getAppointments = asyncHandler(async (req: Request, res: Response) => {
  const options = parsePaginationQuery(req.query);
  const result = await appointmentService.getAllAppointments(options);
  sendSuccess(res, "Appointments retrieved successfully", result.data, result.pagination);
});

export const getAppointmentBySlug = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await appointmentService.getAppointmentBySlug(req.params.slug);
  sendSuccess(res, "Appointment retrieved successfully", appointment);
});
