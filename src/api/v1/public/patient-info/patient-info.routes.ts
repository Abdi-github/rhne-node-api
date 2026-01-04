import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { cacheMiddleware } from "@middleware/cache.middleware";
import { getPatientInfoBySlugSchema } from "./patient-info.validation";
import * as patientInfoController from "./patient-info.controller";

const router = Router();

// GET /api/v1/patient-info
router.get("/", cacheMiddleware("patient-info", 600), patientInfoController.getPatientInfo);

// GET /api/v1/patient-info/:slug
router.get("/:slug", cacheMiddleware("patient-info", 600), validate(getPatientInfoBySlugSchema), patientInfoController.getPatientInfoBySlug);

export default router;
