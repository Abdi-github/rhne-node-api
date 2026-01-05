import type { PaginationOptions, PaginationResult } from "@shared/types/common.types";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const parsePaginationQuery = (
  query: Record<string, unknown>
): PaginationOptions => {
  const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
  const sort = (query.sort as string) || "-createdAt";
  const search = (query.search as string) || undefined;

  return { page, limit, sort, search };
};

export const buildPagination = (
  total: number,
  options: PaginationOptions
): PaginationResult => ({
  page: options.page,
  limit: options.limit,
  total,
  totalPages: Math.ceil(total / options.limit),
});

export const getSkip = (options: PaginationOptions): number =>
  (options.page - 1) * options.limit;

export const parseSortString = (sort: string): Record<string, 1 | -1> => {
  const result: Record<string, 1 | -1> = {};
  const fields = sort.split(",");

  for (const field of fields) {
    const trimmed = field.trim();
    if (trimmed.startsWith("-")) {
      result[trimmed.slice(1)] = -1;
    } else {
      result[trimmed] = 1;
    }
  }

  return result;
};
