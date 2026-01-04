import slugify from "slugify";
import { Event } from "@models/event.model";
import { buildQuery } from "@shared/utils/query-builder";
import { buildPagination } from "@shared/utils/pagination";
import { ApiError } from "@shared/utils/api-error";
import type { PaginationOptions } from "@shared/types/common.types";

export const getAll = async (options: PaginationOptions, isActive?: string) => {
  const { filter, sort, skip, limit } = buildQuery({
    ...options,
    activeOnly: false,
    searchFields: ["title.fr", "title.en"],
  });

  if (isActive !== undefined) filter.is_active = isActive === "true";

  const [data, total] = await Promise.all([
    Event.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Event.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(total, options) };
};

export const getById = async (id: string) => {
  const event = await Event.findById(id).lean();
  if (!event) throw ApiError.notFound("Event");
  return event;
};

export const create = async (data: Record<string, unknown>) => {
  const title = data.title as { fr: string };
  const slug = slugify(title.fr, { lower: true, strict: true });

  const existing = await Event.findOne({ slug });
  if (existing) throw ApiError.conflict("An event with this title already exists");

  const event = await Event.create({ ...data, slug });
  return event.toObject();
};

export const update = async (id: string, data: Record<string, unknown>) => {
  if (data.title) {
    const title = data.title as { fr: string };
    data.slug = slugify(title.fr, { lower: true, strict: true });
    const existing = await Event.findOne({ slug: data.slug, _id: { $ne: id } });
    if (existing) throw ApiError.conflict("An event with this title already exists");
  }

  const event = await Event.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  if (!event) throw ApiError.notFound("Event");
  return event;
};

export const softDelete = async (id: string) => {
  const event = await Event.findByIdAndUpdate(id, { is_active: false }, { new: true }).lean();
  if (!event) throw ApiError.notFound("Event");
  return event;
};
