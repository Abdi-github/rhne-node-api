import slugify from "slugify";
import { EmergencyHotline } from "@models/emergency-hotline.model";
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

  const defaultSort = Object.keys(sort).length > 0 ? sort : { display_order: 1 as const };

  const [data, total] = await Promise.all([
    EmergencyHotline.find(filter).sort(defaultSort).skip(skip).limit(limit).lean(),
    EmergencyHotline.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(total, options) };
};

export const getById = async (id: string) => {
  const hotline = await EmergencyHotline.findById(id).lean();
  if (!hotline) throw ApiError.notFound("Emergency hotline");
  return hotline;
};

export const create = async (data: Record<string, unknown>) => {
  const title = data.title as { fr: string };
  const slug = slugify(title.fr, { lower: true, strict: true });

  const existing = await EmergencyHotline.findOne({ slug });
  if (existing) throw ApiError.conflict("An emergency hotline with this title already exists");

  const hotline = await EmergencyHotline.create({ ...data, slug });
  return hotline.toObject();
};

export const update = async (id: string, data: Record<string, unknown>) => {
  if (data.title) {
    const title = data.title as { fr: string };
    data.slug = slugify(title.fr, { lower: true, strict: true });
    const existing = await EmergencyHotline.findOne({ slug: data.slug, _id: { $ne: id } });
    if (existing) throw ApiError.conflict("An emergency hotline with this title already exists");
  }

  const hotline = await EmergencyHotline.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();
  if (!hotline) throw ApiError.notFound("Emergency hotline");
  return hotline;
};

export const softDelete = async (id: string) => {
  const hotline = await EmergencyHotline.findByIdAndUpdate(
    id,
    { is_active: false },
    { new: true }
  ).lean();
  if (!hotline) throw ApiError.notFound("Emergency hotline");
  return hotline;
};
