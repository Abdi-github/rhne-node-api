import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { idParamSchema } from "@shared/utils/zod-schemas";
import {
  createEmergencyHotlineSchema,
  updateEmergencyHotlineSchema,
} from "./emergency-hotline.validation";
import * as emergencyHotlineController from "./emergency-hotline.controller";

const router = Router();

router.get("/", emergencyHotlineController.getEmergencyHotlines);
router.post(
  "/",
  validate(createEmergencyHotlineSchema),
  emergencyHotlineController.createEmergencyHotline
);
router.get("/:id", validate(idParamSchema), emergencyHotlineController.getEmergencyHotlineById);
router.put(
  "/:id",
  validate(updateEmergencyHotlineSchema),
  emergencyHotlineController.updateEmergencyHotline
);
router.delete("/:id", validate(idParamSchema), emergencyHotlineController.deleteEmergencyHotline);

export default router;
