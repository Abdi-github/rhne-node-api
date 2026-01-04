import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { cacheMiddleware } from "@middleware/cache.middleware";
import { getAppointmentBySlugSchema } from "./appointment.validation";
import * as appointmentController from "./appointment.controller";

const router = Router();

router.get(
  "/",
  cacheMiddleware("appointments", 300),
  appointmentController.getAppointments
);
router.get(
  "/:slug",
  cacheMiddleware("appointments", 300),
  validate(getAppointmentBySlugSchema),
  appointmentController.getAppointmentBySlug
);

export default router;
