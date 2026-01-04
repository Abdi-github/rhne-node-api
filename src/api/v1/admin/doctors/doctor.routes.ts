import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { idParamSchema } from "@shared/utils/zod-schemas";
import { createDoctorSchema, updateDoctorSchema } from "./doctor.validation";
import * as doctorController from "./doctor.controller";

const router = Router();

router.get("/", doctorController.getDoctors);
router.post("/", validate(createDoctorSchema), doctorController.createDoctor);
router.get("/:id", validate(idParamSchema), doctorController.getDoctorById);
router.put("/:id", validate(updateDoctorSchema), doctorController.updateDoctor);
router.delete("/:id", validate(idParamSchema), doctorController.deleteDoctor);

export default router;
