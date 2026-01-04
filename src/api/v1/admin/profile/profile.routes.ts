import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { updateProfileSchema, changePasswordSchema } from "./profile.validation";
import * as profileController from "./profile.controller";

const router = Router();

router.get("/", profileController.getProfile);
router.put("/", validate(updateProfileSchema), profileController.updateProfile);
router.put("/password", validate(changePasswordSchema), profileController.changePassword);

export default router;
