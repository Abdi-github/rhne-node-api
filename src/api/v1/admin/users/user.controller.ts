import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess, sendCreated } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as userService from "./user.service";

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const options = parsePaginationQuery(req.query);
  const result = await userService.getAll(options, req.query.is_active as string | undefined);
  sendSuccess(res, "Users retrieved successfully", result.data, result.pagination);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getById(req.params.id);
  sendSuccess(res, "User retrieved successfully", user);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.create(req.body);
  sendCreated(res, "User created successfully", user);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.update(req.params.id, req.body);
  sendSuccess(res, "User updated successfully", user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.softDelete(req.params.id);
  sendSuccess(res, "User deleted successfully", null);
});

export const assignRoles = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.assignRoles(req.params.id, req.body.role_ids);
  sendSuccess(res, "Roles assigned successfully", user);
});
