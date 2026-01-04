import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess } from "@shared/utils/api-response";
import { parsePaginationQuery } from "@shared/utils/pagination";
import * as eventService from "./event.service";

// GET /api/v1/events
export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const options = parsePaginationQuery(req.query);
  const result = await eventService.getAllEvents(options);
  sendSuccess(res, "Events retrieved successfully", result.data, result.pagination);
});

// GET /api/v1/events/:slug
export const getEventBySlug = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.getEventBySlug(req.params.slug);
  sendSuccess(res, "Event retrieved successfully", event);
});
