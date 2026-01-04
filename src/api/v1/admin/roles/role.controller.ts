import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess, sendCreated } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as roleService from "./role.service";

export const getRoles = asyncHandler(async (req: Request, res: Response) => {
  const options = parsePaginationQuery(req.query);
  const result = await roleService.getAll(
    options,
    req.query.is_active as string | undefined
  );
  sendSuccess(res, "Roles retrieved successfully", result.data, result.pagination);
});

export const getRoleById = asyncHandler(async (req: Request, res: Response) => {
  const role = await roleService.getById(req.params.id);
  sendSuccess(res, "Role retrieved successfully", role);
});

export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await roleService.create(req.body);
  sendCreated(res, "Role created successfully", role);
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await roleService.update(req.params.id, req.body);
  sendSuccess(res, "Role updated successfully", role);
});

export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  await roleService.remove(req.params.id);
  sendSuccess(res, "Role deleted successfully", null);
});

export const assignPermissions = asyncHandler(
  async (req: Request, res: Response) => {
    const role = await roleService.assignPermissions(
      req.params.id,
      req.body.permission_ids
    );
    sendSuccess(res, "Permissions assigned successfully", role);
  }
);
