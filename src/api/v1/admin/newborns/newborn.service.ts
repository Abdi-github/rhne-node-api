import { Newborn } from "@models/newborn.model";
import { buildPagination } from "@shared/utils/pagination";
import { ApiError } from "@shared/utils/api-error";
import type { PaginationOptions } from "@shared/types/common.types";
import { getSkip, parseSortString } from "@shared/utils/pagination";

export const getAll = async (options: PaginationOptions) => {
  const { page, limit, search, sort } = options;
  const skip = getSkip(page, limit);

  const filter: Record<string, unknown> = {};

  if (search) {
    filter.$or = [{ name: { $regex: search, $options: "i" } }];
  }

  const sortObj = parseSortString(sort || "-date");

  const [data, total] = await Promise.all([
    Newborn.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
    Newborn.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(total, options) };
};

export const getById = async (id: string) => {
  const newborn = await Newborn.findById(id).lean();
  if (!newborn) throw ApiError.notFound("Newborn");
  return newborn;
};

export const create = async (data: Record<string, unknown>) => {
  const newborn = await Newborn.create(data);
  return newborn.toObject();
};

export const update = async (id: string, data: Record<string, unknown>) => {
  const newborn = await Newborn.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  if (!newborn) throw ApiError.notFound("Newborn");
  return newborn;
};

export const remove = async (id: string) => {
  const newborn = await Newborn.findByIdAndDelete(id).lean();
  if (!newborn) throw ApiError.notFound("Newborn");
  return newborn;
};
