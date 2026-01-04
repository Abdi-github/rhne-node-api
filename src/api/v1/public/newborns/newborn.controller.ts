import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as newbornService from "./newborn.service";

// GET /api/v1/newborns
export const getNewborns = asyncHandler(async (req: Request, res: Response) => {
  const options = parsePaginationQuery(req.query);
  const queryFilters = {
    date: req.query.date as string | undefined,
    month: req.query.month as string | undefined,
  };
  const result = await newbornService.getAllNewborns(options, queryFilters);
  sendSuccess(res, "Newborns retrieved successfully", result.data, result.pagination);
});
