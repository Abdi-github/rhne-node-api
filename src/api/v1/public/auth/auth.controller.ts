import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess } from "@shared/utils/api-response";
import * as authService from "./auth.service";

// POST /api/v1/auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const result = await authService.login(email, password, ip);
  sendSuccess(res, "Login successful", result);
});

// POST /api/v1/auth/refresh
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refresh_token } = req.body;
  const result = await authService.refreshAccessToken(refresh_token);
  sendSuccess(res, "Token refreshed successfully", result);
});

// POST /api/v1/auth/logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refresh_token } = req.body;
  await authService.logout(refresh_token);
  sendSuccess(res, "Logout successful", null);
});

// POST /api/v1/auth/forgot-password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  sendSuccess(res, "If the email exists, a reset link has been sent", null);
});

// POST /api/v1/auth/reset-password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  sendSuccess(res, "Password reset successful", null);
});
