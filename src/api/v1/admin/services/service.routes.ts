import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { idParamSchema } from "@shared/utils/zod-schemas";
import {
  createServiceSchema,
  updateServiceSchema,
  createServiceContactSchema,
  updateServiceContactSchema,
  createServiceLinkSchema,
  updateServiceLinkSchema,
} from "./service.validation";
import * as serviceController from "./service.controller";

const router = Router();

// ── Services CRUD ──
router.get("/", serviceController.getServices);
router.post("/", validate(createServiceSchema), serviceController.createService);
router.get("/:id", validate(idParamSchema), serviceController.getServiceById);
router.put("/:id", validate(updateServiceSchema), serviceController.updateService);
router.delete("/:id", validate(idParamSchema), serviceController.deleteService);

// ── Service Contacts ──
router.get("/:id/contacts", validate(idParamSchema), serviceController.getServiceContacts);
router.post("/:id/contacts", validate(createServiceContactSchema), serviceController.createServiceContact);

// ── Service Links ──
router.get("/:id/links", validate(idParamSchema), serviceController.getServiceLinks);
router.post("/:id/links", validate(createServiceLinkSchema), serviceController.createServiceLink);

export default router;

// Separate routers for service-contacts/:id and service-links/:id
export const serviceContactRouter = Router();
serviceContactRouter.put("/:id", validate(updateServiceContactSchema), serviceController.updateServiceContact);
serviceContactRouter.delete("/:id", validate(idParamSchema), serviceController.deleteServiceContact);

export const serviceLinkRouter = Router();
serviceLinkRouter.put("/:id", validate(updateServiceLinkSchema), serviceController.updateServiceLink);
serviceLinkRouter.delete("/:id", validate(idParamSchema), serviceController.deleteServiceLink);
