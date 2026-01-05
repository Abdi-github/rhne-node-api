import type { PaginationOptions } from "@shared/types/common.types";
import { getSkip, parseSortString } from "@shared/utils/pagination";

interface QueryResult {
  filter: Record<string, unknown>;
  sort: Record<string, 1 | -1>;
  skip: number;
  limit: number;
}

interface QueryBuilderOptions extends PaginationOptions {
  searchFields?: string[];
  filters?: Record<string, unknown>;
  activeOnly?: boolean;
}

export const buildQuery = (options: QueryBuilderOptions): QueryResult => {
  const filter: Record<string, unknown> = {};

  // Active filter (public endpoints always filter active only)
  if (options.activeOnly !== false) {
    filter.is_active = true;
  }

  // Merge custom filters
  if (options.filters) {
    for (const [key, value] of Object.entries(options.filters)) {
      if (value !== undefined && value !== null && value !== "") {
        filter[key] = value;
      }
    }
  }

  // Full-text search
  if (options.search && options.searchFields && options.searchFields.length > 0) {
    const searchRegex = new RegExp(escapeRegex(options.search), "i");
    filter.$or = options.searchFields.map((field) => ({
      [field]: searchRegex,
    }));
  }

  return {
    filter,
    sort: parseSortString(options.sort),
    skip: getSkip(options),
    limit: options.limit,
  };
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
