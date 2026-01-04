import { EmergencyHotline } from "@models/emergency-hotline.model";
import { buildQuery } from "@shared/utils/query-builder";
import { buildPagination } from "@shared/utils/pagination";
import { ApiError } from "@shared/utils/api-error";
import type { PaginationOptions } from "@shared/types/common.types";

export const getAllEmergencyHotlines = async (options: PaginationOptions) => {
  const { filter, sort, skip, limit } = buildQuery({
    ...options,
    activeOnly: true,
    searchFields: ["title.fr", "title.en", "title.de", "title.it"],
  });

  const effectiveSort = Object.keys(sort).length > 0 ? sort : { display_order: 1 as const };

  const [data, total] = await Promise.all([
    EmergencyHotline.find(filter).sort(effectiveSort).skip(skip).limit(limit).lean(),
    EmergencyHotline.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(total, options) };
};

export const getEmergencyHotlineBySlug = async (slug: string) => {
  const hotline = await EmergencyHotline.findOne({ slug, is_active: true }).lean();
  if (!hotline) throw ApiError.notFound("Emergency hotline");
  return hotline;
};
