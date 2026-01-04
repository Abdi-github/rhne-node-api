import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { cacheMiddleware } from "@middleware/cache.middleware";
import { getEventBySlugSchema } from "./event.validation";
import * as eventController from "./event.controller";

const router = Router();

// GET /api/v1/events
router.get("/", cacheMiddleware("events", 300), eventController.getEvents);

// GET /api/v1/events/:slug
router.get("/:slug", cacheMiddleware("events", 300), validate(getEventBySlugSchema), eventController.getEventBySlug);

export default router;
