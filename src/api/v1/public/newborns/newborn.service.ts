import { Newborn } from "@models/newborn.model";
import { buildQuery } from "@shared/utils/query-builder";
import { buildPagination } from "@shared/utils/pagination";
import type { PaginationOptions } from "@shared/types/common.types";

export const getAllNewborns = async (
  options: PaginationOptions,
  queryFilters: { date?: string; month?: string }
) => {
  const filters: Record<string, unknown> = {};

  // Filter by exact date
  if (queryFilters.date) {
    filters.date = queryFilters.date;
  }

  // Filter by month (partial match on date string, e.g. "mars 2026")
  if (queryFilters.month) {
    filters.date = { $regex: queryFilters.month, $options: "i" };
  }

  const { filter, sort, skip, limit } = buildQuery({
    ...options,
    filters,
    activeOnly: false, // Newborns don't have is_active
    searchFields: ["name"],
  });

  // Remove is_active filter (newborns don't have it)
  delete filter.is_active;

  const [data, total] = await Promise.all([
    Newborn.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Newborn.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(total, options) };
};
