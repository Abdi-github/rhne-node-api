import { Permission } from "@models/permission.model";
import { buildQuery } from "@shared/utils/query-builder";
import { buildPagination } from "@shared/utils/pagination";
import type { PaginationOptions } from "@shared/types/common.types";

export const getAll = async (
  options: PaginationOptions,
  resource?: string,
  action?: string
) => {
  const filters: Record<string, unknown> = {};
  if (resource) filters.resource = resource;
  if (action) filters.action = action;

  const { filter, sort, skip, limit } = buildQuery({
    ...options,
    activeOnly: false,
    searchFields: ["name", "display_name", "resource"],
    filters,
  });

  const defaultSort =
    Object.keys(sort).length > 0
      ? sort
      : ({ resource: 1, action: 1 } as Record<string, 1 | -1>);

  const [data, total] = await Promise.all([
    Permission.find(filter).sort(defaultSort).skip(skip).limit(limit).lean(),
    Permission.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(total, options) };
};
