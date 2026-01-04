import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { idParamSchema } from "@shared/utils/zod-schemas";
import { createUserSchema, updateUserSchema, assignRolesSchema } from "./user.validation";
import * as userController from "./user.controller";

const router = Router();

router.get("/", userController.getUsers);
router.post("/", validate(createUserSchema), userController.createUser);
router.get("/:id", validate(idParamSchema), userController.getUserById);
router.put("/:id", validate(updateUserSchema), userController.updateUser);
router.delete("/:id", validate(idParamSchema), userController.deleteUser);
router.put("/:id/roles", validate(assignRolesSchema), userController.assignRoles);

export default router;
