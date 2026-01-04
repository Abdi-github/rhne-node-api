import { Job } from "@models/job.model";
import { buildQuery } from "@shared/utils/query-builder";
import { buildPagination } from "@shared/utils/pagination";
import { ApiError } from "@shared/utils/api-error";
import type { PaginationOptions } from "@shared/types/common.types";

export const getAllJobs = async (
  options: PaginationOptions,
  queryFilters: { category?: string; site?: string }
) => {
  const filters: Record<string, unknown> = {};

  if (queryFilters.category && queryFilters.category !== "all") {
    filters.category = queryFilters.category;
  }

  if (queryFilters.site) {
    filters.site = queryFilters.site;
  }

  const { filter, sort, skip, limit } = buildQuery({
    ...options,
    filters,
    activeOnly: true,
    searchFields: ["title.fr", "title.en", "title.de", "title.it", "department"],
  });

  const [data, total] = await Promise.all([
    Job.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Job.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(total, options) };
};

export const getJobById = async (id: string) => {
  const job = await Job.findOne({ _id: id, is_active: true }).lean();

  if (!job) {
    throw ApiError.notFound("Job");
  }

  return job;
};
