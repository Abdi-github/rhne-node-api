import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { idParamSchema } from "@shared/utils/zod-schemas";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
} from "./appointment.validation";
import * as appointmentController from "./appointment.controller";

const router = Router();

router.get("/", appointmentController.getAppointments);
router.post("/", validate(createAppointmentSchema), appointmentController.createAppointment);
router.get("/:id", validate(idParamSchema), appointmentController.getAppointmentById);
router.put("/:id", validate(updateAppointmentSchema), appointmentController.updateAppointment);
router.delete("/:id", validate(idParamSchema), appointmentController.deleteAppointment);

export default router;
