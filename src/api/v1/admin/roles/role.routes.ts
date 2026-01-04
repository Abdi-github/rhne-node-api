import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { idParamSchema } from "@shared/utils/zod-schemas";
import {
  createRoleSchema,
  updateRoleSchema,
  assignPermissionsSchema,
} from "./role.validation";
import * as roleController from "./role.controller";

const router = Router();

router.get("/", roleController.getRoles);
router.post("/", validate(createRoleSchema), roleController.createRole);
router.get("/:id", validate(idParamSchema), roleController.getRoleById);
router.put("/:id", validate(updateRoleSchema), roleController.updateRole);
router.delete("/:id", validate(idParamSchema), roleController.deleteRole);
router.put(
  "/:id/permissions",
  validate(assignPermissionsSchema),
  roleController.assignPermissions
);

export default router;
