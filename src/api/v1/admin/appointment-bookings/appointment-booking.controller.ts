import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as appointmentBookingService from "./appointment-booking.service";

export const getAppointmentBookings = asyncHandler(
  async (req: Request, res: Response) => {
    const options = parsePaginationQuery(req.query);
    const result = await appointmentBookingService.getAll(options, {
      status: req.query.status as string | undefined,
      appointment_type: req.query.appointment_type as string | undefined,
      date_from: req.query.date_from as string | undefined,
      date_to: req.query.date_to as string | undefined,
    });
    sendSuccess(
      res,
      "Appointment bookings retrieved successfully",
      result.data,
      result.pagination
    );
  }
);

export const getAppointmentBookingById = asyncHandler(
  async (req: Request, res: Response) => {
    const booking = await appointmentBookingService.getById(req.params.id);
    sendSuccess(res, "Appointment booking retrieved successfully", booking);
  }
);

export const updateBookingStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user?._id;
    const booking = await appointmentBookingService.updateStatus(
      req.params.id,
      req.body.status,
      userId,
      req.body.notes
    );
    sendSuccess(res, "Booking status updated successfully", booking);
  }
);

export const deleteAppointmentBooking = asyncHandler(
  async (req: Request, res: Response) => {
    await appointmentBookingService.remove(req.params.id);
    sendSuccess(res, "Appointment booking deleted successfully", null);
  }
);
