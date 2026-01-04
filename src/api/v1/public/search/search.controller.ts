import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess } from "@shared/utils/api-response";
import * as searchService from "./search.service";

export const search = asyncHandler(async (req: Request, res: Response) => {
  const { q, limit, resources } = req.query as {
    q: string;
    limit?: number;
    resources?: string[];
  };

  const results = await searchService.search({
    q,
    limit: Number(limit) || 10,
    resources: resources as string[] | undefined,
  });

  sendSuccess(res, "Search results retrieved successfully", results);
});
