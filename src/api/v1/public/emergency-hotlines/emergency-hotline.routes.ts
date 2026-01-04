import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { cacheMiddleware } from "@middleware/cache.middleware";
import { getEmergencyHotlineBySlugSchema } from "./emergency-hotline.validation";
import * as emergencyHotlineController from "./emergency-hotline.controller";

const router = Router();

router.get(
  "/",
  cacheMiddleware("emergency-hotlines", 300),
  emergencyHotlineController.getEmergencyHotlines
);
router.get(
  "/:slug",
  cacheMiddleware("emergency-hotlines", 300),
  validate(getEmergencyHotlineBySlugSchema),
  emergencyHotlineController.getEmergencyHotlineBySlug
);

export default router;
