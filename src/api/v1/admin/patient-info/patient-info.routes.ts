import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { idParamSchema } from "@shared/utils/zod-schemas";
import { createPatientInfoSchema, updatePatientInfoSchema } from "./patient-info.validation";
import * as patientInfoController from "./patient-info.controller";

const router = Router();

router.get("/", patientInfoController.getPatientInfoPages);
router.post("/", validate(createPatientInfoSchema), patientInfoController.createPatientInfo);
router.get("/:id", validate(idParamSchema), patientInfoController.getPatientInfoById);
router.put("/:id", validate(updatePatientInfoSchema), patientInfoController.updatePatientInfo);
router.delete("/:id", validate(idParamSchema), patientInfoController.deletePatientInfo);

export default router;
