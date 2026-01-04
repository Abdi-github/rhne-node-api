import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { idParamSchema } from "@shared/utils/zod-schemas";
import { createJobSchema, updateJobSchema } from "./job.validation";
import * as jobController from "./job.controller";

const router = Router();

router.get("/", jobController.getJobs);
router.post("/", validate(createJobSchema), jobController.createJob);
router.get("/:id", validate(idParamSchema), jobController.getJobById);
router.put("/:id", validate(updateJobSchema), jobController.updateJob);
router.delete("/:id", validate(idParamSchema), jobController.deleteJob);

export default router;
