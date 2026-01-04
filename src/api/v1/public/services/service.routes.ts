import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { cacheMiddleware } from "@middleware/cache.middleware";
import { getServiceBySlugSchema } from "./service.validation";
import * as serviceController from "./service.controller";

const router = Router();

// GET /api/v1/services
router.get("/", cacheMiddleware("services", 300), serviceController.getServices);

// GET /api/v1/services/:slug
router.get("/:slug", cacheMiddleware("services", 300), validate(getServiceBySlugSchema), serviceController.getServiceBySlug);

export default router;
