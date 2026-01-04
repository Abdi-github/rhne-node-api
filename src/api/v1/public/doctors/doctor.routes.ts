import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { cacheMiddleware } from "@middleware/cache.middleware";
import { getDoctorByIdSchema } from "./doctor.validation";
import * as doctorController from "./doctor.controller";

const router = Router();

// GET /api/v1/doctors
router.get("/", cacheMiddleware("doctors", 300), doctorController.getDoctors);

// GET /api/v1/doctors/:id
router.get("/:id", cacheMiddleware("doctors", 300), validate(getDoctorByIdSchema), doctorController.getDoctorById);

export default router;
