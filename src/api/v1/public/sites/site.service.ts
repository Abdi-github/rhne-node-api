import { Site } from "@models/site.model";
import { buildQuery } from "@shared/utils/query-builder";
import { buildPagination } from "@shared/utils/pagination";
import { ApiError } from "@shared/utils/api-error";
import type { PaginationOptions } from "@shared/types/common.types";

export const getAllSites = async (options: PaginationOptions) => {
  const { filter, sort, skip, limit } = buildQuery({
    ...options,
    activeOnly: true,
    searchFields: ["name", "city", "type.fr", "type.en"],
  });

  const [data, total] = await Promise.all([
    Site.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Site.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(total, options) };
};

export const getSiteBySlug = async (slug: string) => {
  const site = await Site.findOne({ slug, is_active: true }).lean();

  if (!site) {
    throw ApiError.notFound("Site");
  }

  return site;
};
