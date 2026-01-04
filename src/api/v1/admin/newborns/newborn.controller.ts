import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess, sendCreated } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as newbornService from "./newborn.service";

export const getNewborns = asyncHandler(async (req: Request, res: Response) => {
  const options = parsePaginationQuery(req.query);
  const result = await newbornService.getAll(options);
  sendSuccess(res, "Newborns retrieved successfully", result.data, result.pagination);
});

export const getNewbornById = asyncHandler(async (req: Request, res: Response) => {
  const newborn = await newbornService.getById(req.params.id);
  sendSuccess(res, "Newborn retrieved successfully", newborn);
});

export const createNewborn = asyncHandler(async (req: Request, res: Response) => {
  const newborn = await newbornService.create(req.body);
  sendCreated(res, "Newborn created successfully", newborn);
});

export const updateNewborn = asyncHandler(async (req: Request, res: Response) => {
  const newborn = await newbornService.update(req.params.id, req.body);
  sendSuccess(res, "Newborn updated successfully", newborn);
});

export const deleteNewborn = asyncHandler(async (req: Request, res: Response) => {
  await newbornService.remove(req.params.id);
  sendSuccess(res, "Newborn deleted successfully", null);
});
