import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { idParamSchema } from "@shared/utils/zod-schemas";
import { updateBookingStatusSchema } from "./appointment-booking.validation";
import * as appointmentBookingController from "./appointment-booking.controller";

const router = Router();

router.get("/", appointmentBookingController.getAppointmentBookings);
router.get(
  "/:id",
  validate(idParamSchema),
  appointmentBookingController.getAppointmentBookingById
);
router.put(
  "/:id/status",
  validate(updateBookingStatusSchema),
  appointmentBookingController.updateBookingStatus
);
router.delete(
  "/:id",
  validate(idParamSchema),
  appointmentBookingController.deleteAppointmentBooking
);

export default router;
