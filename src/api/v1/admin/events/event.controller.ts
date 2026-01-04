import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess, sendCreated } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as eventService from "./event.service";

export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const options = parsePaginationQuery(req.query);
  const result = await eventService.getAll(options, req.query.is_active as string | undefined);
  sendSuccess(res, "Events retrieved successfully", result.data, result.pagination);
});

export const getEventById = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.getById(req.params.id);
  sendSuccess(res, "Event retrieved successfully", event);
});

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.create(req.body);
  sendCreated(res, "Event created successfully", event);
});

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.update(req.params.id, req.body);
  sendSuccess(res, "Event updated successfully", event);
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  await eventService.softDelete(req.params.id);
  sendSuccess(res, "Event deleted successfully", null);
});
