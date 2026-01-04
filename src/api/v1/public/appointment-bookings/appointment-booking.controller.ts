import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess, sendCreated } from "@shared/utils/api-response";
import * as bookingService from "./appointment-booking.service";

export const createBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const booking = await bookingService.createBooking(req.body);
    sendCreated(res, "Booking created successfully", booking);
  }
);

export const getBookingByReference = asyncHandler(
  async (req: Request, res: Response) => {
    const booking = await bookingService.getBookingByReference(
      req.params.reference
    );
    sendSuccess(res, "Booking retrieved successfully", booking);
  }
);

export const cancelBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await bookingService.cancelBooking(
      req.params.reference,
      req.body.reason
    );
    sendSuccess(res, "Booking cancelled successfully", result);
  }
);

export const getAvailableSlots = asyncHandler(
  async (req: Request, res: Response) => {
    const { appointment_type, date, site_id } = req.query;
    const slots = await bookingService.getAvailableSlots(
      appointment_type as string,
      date as string,
      site_id as string | undefined
    );
    sendSuccess(res, "Available slots retrieved successfully", slots);
  }
);
