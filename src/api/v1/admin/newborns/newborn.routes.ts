import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { idParamSchema } from "@shared/utils/zod-schemas";
import { createNewbornSchema, updateNewbornSchema } from "./newborn.validation";
import * as newbornController from "./newborn.controller";

const router = Router();

router.get("/", newbornController.getNewborns);
router.post("/", validate(createNewbornSchema), newbornController.createNewborn);
router.get("/:id", validate(idParamSchema), newbornController.getNewbornById);
router.put("/:id", validate(updateNewbornSchema), newbornController.updateNewborn);
router.delete("/:id", validate(idParamSchema), newbornController.deleteNewborn);

export default router;
