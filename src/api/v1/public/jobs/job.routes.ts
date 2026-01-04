import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { cacheMiddleware } from "@middleware/cache.middleware";
import { getJobByIdSchema } from "./job.validation";
import * as jobController from "./job.controller";

const router = Router();

// GET /api/v1/jobs
router.get("/", cacheMiddleware("jobs", 300), jobController.getJobs);

// GET /api/v1/jobs/:id
router.get("/:id", cacheMiddleware("jobs", 300), validate(getJobByIdSchema), jobController.getJobById);

export default router;
