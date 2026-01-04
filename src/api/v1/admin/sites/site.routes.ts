import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { idParamSchema } from "@shared/utils/zod-schemas";
import { createSiteSchema, updateSiteSchema } from "./site.validation";
import * as siteController from "./site.controller";

const router = Router();

router.get("/", siteController.getSites);
router.post("/", validate(createSiteSchema), siteController.createSite);
router.get("/:id", validate(idParamSchema), siteController.getSiteById);
router.put("/:id", validate(updateSiteSchema), siteController.updateSite);
router.delete("/:id", validate(idParamSchema), siteController.deleteSite);

export default router;
