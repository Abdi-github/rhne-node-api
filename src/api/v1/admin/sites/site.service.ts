import slugify from "slugify";
import { Site } from "@models/site.model";
import { buildQuery } from "@shared/utils/query-builder";
import { buildPagination } from "@shared/utils/pagination";
import { ApiError } from "@shared/utils/api-error";
import type { PaginationOptions } from "@shared/types/common.types";

export const getAll = async (options: PaginationOptions, isActive?: string) => {
  const { filter, sort, skip, limit } = buildQuery({
    ...options,
    activeOnly: false,
    searchFields: ["name", "city", "type.fr", "type.en"],
  });

  if (isActive !== undefined) {
    filter.is_active = isActive === "true";
  }

  const [data, total] = await Promise.all([
    Site.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Site.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(total, options) };
};

export const getById = async (id: string) => {
  const site = await Site.findById(id).lean();
  if (!site) throw ApiError.notFound("Site");
  return site;
};

export const create = async (data: Record<string, unknown>) => {
  const slug = slugify(data.name as string, { lower: true, strict: true });

  const existing = await Site.findOne({ slug });
  if (existing) throw ApiError.conflict("A site with this name already exists");

  const site = await Site.create({ ...data, slug });
  return site.toObject();
};

export const update = async (id: string, data: Record<string, unknown>) => {
  if (data.name) {
    data.slug = slugify(data.name as string, { lower: true, strict: true });
    const existing = await Site.findOne({ slug: data.slug, _id: { $ne: id } });
    if (existing) throw ApiError.conflict("A site with this name already exists");
  }

  const site = await Site.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!site) throw ApiError.notFound("Site");
  return site;
};

export const softDelete = async (id: string) => {
  const site = await Site.findByIdAndUpdate(
    id,
    { is_active: false },
    { new: true }
  ).lean();

  if (!site) throw ApiError.notFound("Site");
  return site;
};
