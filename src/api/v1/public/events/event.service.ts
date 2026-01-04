import { Event } from "@models/event.model";
import { buildQuery } from "@shared/utils/query-builder";
import { buildPagination } from "@shared/utils/pagination";
import { ApiError } from "@shared/utils/api-error";
import type { PaginationOptions } from "@shared/types/common.types";

export const getAllEvents = async (options: PaginationOptions) => {
  const { filter, sort, skip, limit } = buildQuery({
    ...options,
    activeOnly: true,
    searchFields: ["title.fr", "title.en", "title.de", "title.it"],
  });

  // Default sort by date ascending (upcoming first)
  const effectiveSort = Object.keys(sort).length > 0 ? sort : { date: 1 as const };

  const [data, total] = await Promise.all([
    Event.find(filter).sort(effectiveSort).skip(skip).limit(limit).lean(),
    Event.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(total, options) };
};

export const getEventBySlug = async (slug: string) => {
  const event = await Event.findOne({ slug, is_active: true }).lean();

  if (!event) {
    throw ApiError.notFound("Event");
  }

  return event;
};
