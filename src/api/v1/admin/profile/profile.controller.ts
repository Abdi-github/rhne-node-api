import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess } from "@shared/utils/api-response";
import * as profileService from "./profile.service";

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await profileService.getProfile(req.userId!);
  sendSuccess(res, "Profile retrieved successfully", profile);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await profileService.updateProfile(req.userId!, req.body);
  sendSuccess(res, "Profile updated successfully", profile);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { current_password, new_password } = req.body;
  await profileService.changePassword(req.userId!, current_password, new_password);
  sendSuccess(res, "Password changed successfully", null);
});
