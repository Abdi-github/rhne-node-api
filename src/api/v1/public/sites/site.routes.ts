import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { cacheMiddleware } from "@middleware/cache.middleware";
import { getSiteBySlugSchema } from "./site.validation";
import * as siteController from "./site.controller";

const router = Router();

// GET /api/v1/sites
router.get("/", cacheMiddleware("sites", 600), siteController.getSites);

// GET /api/v1/sites/:slug
router.get("/:slug", cacheMiddleware("sites", 600), validate(getSiteBySlugSchema), siteController.getSiteBySlug);

export default router;
