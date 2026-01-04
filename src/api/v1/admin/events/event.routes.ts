import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { idParamSchema } from "@shared/utils/zod-schemas";
import { createEventSchema, updateEventSchema } from "./event.validation";
import * as eventController from "./event.controller";

const router = Router();

router.get("/", eventController.getEvents);
router.post("/", validate(createEventSchema), eventController.createEvent);
router.get("/:id", validate(idParamSchema), eventController.getEventById);
router.put("/:id", validate(updateEventSchema), eventController.updateEvent);
router.delete("/:id", validate(idParamSchema), eventController.deleteEvent);

export default router;
