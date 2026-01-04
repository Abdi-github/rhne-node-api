import { Router } from "express";
import { cacheMiddleware } from "@middleware/cache.middleware";
import * as newbornController from "./newborn.controller";

const router = Router();

// GET /api/v1/newborns
router.get("/", cacheMiddleware("newborns", 600), newbornController.getNewborns);

export default router;
