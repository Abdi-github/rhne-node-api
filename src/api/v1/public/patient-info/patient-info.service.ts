import { PatientInfo } from "@models/patient-info.model";
import { buildQuery } from "@shared/utils/query-builder";
import { buildPagination } from "@shared/utils/pagination";
import { ApiError } from "@shared/utils/api-error";
import type { PaginationOptions } from "@shared/types/common.types";

export const getAllPatientInfo = async (
  options: PaginationOptions,
  queryFilters: { section?: string }
) => {
  const filters: Record<string, unknown> = {};

  if (queryFilters.section) {
    filters.section = queryFilters.section;
  }

  const { filter, sort, skip, limit } = buildQuery({
    ...options,
    filters,
    activeOnly: false, // Patient info pages don't have is_active
    searchFields: ["title.fr", "title.en", "title.de", "title.it", "section"],
  });

  // Remove is_active filter
  delete filter.is_active;

  const [data, total] = await Promise.all([
    PatientInfo.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    PatientInfo.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(total, options) };
};

export const getPatientInfoBySlug = async (slug: string) => {
  const info = await PatientInfo.findOne({ slug }).lean();

  if (!info) {
    throw ApiError.notFound("Patient info page");
  }

  return info;
};
