import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import {
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation";
import * as authController from "./auth.controller";

const router = Router();

// POST /api/v1/auth/login
router.post("/login", validate(loginSchema), authController.login);

// POST /api/v1/auth/refresh
router.post("/refresh", validate(refreshTokenSchema), authController.refresh);

// POST /api/v1/auth/logout
router.post("/logout", validate(logoutSchema), authController.logout);

// POST /api/v1/auth/forgot-password
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);

// POST /api/v1/auth/reset-password
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

export default router;
