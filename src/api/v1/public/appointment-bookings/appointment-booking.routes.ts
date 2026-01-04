import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import {
  createBookingSchema,
  getBookingByReferenceSchema,
  cancelBookingSchema,
  getAvailableSlotsSchema,
} from "./appointment-booking.validation";
import * as appointmentBookingController from "./appointment-booking.controller";

const router = Router();

router.get(
  "/slots",
  validate(getAvailableSlotsSchema),
  appointmentBookingController.getAvailableSlots
);

router.post(
  "/",
  validate(createBookingSchema),
  appointmentBookingController.createBooking
);

router.get(
  "/:reference",
  validate(getBookingByReferenceSchema),
  appointmentBookingController.getBookingByReference
);

router.put(
  "/:reference/cancel",
  validate(cancelBookingSchema),
  appointmentBookingController.cancelBooking
);

export default router;
