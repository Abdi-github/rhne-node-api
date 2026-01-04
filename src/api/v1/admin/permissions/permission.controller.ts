import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as permissionService from "./permission.service";

export const getPermissions = asyncHandler(
  async (req: Request, res: Response) => {
    const options = parsePaginationQuery(req.query);
    const result = await permissionService.getAll(
      options,
      req.query.resource as string | undefined,
      req.query.action as string | undefined
    );
    sendSuccess(
      res,
      "Permissions retrieved successfully",
      result.data,
      result.pagination
    );
  }
);
