import { Doctor } from "@models/doctor.model";
import { buildQuery } from "@shared/utils/query-builder";
import { buildPagination } from "@shared/utils/pagination";
import { ApiError } from "@shared/utils/api-error";
import type { PaginationOptions } from "@shared/types/common.types";

export const getAllDoctors = async (
  options: PaginationOptions,
  queryFilters: { service?: string }
) => {
  const filters: Record<string, unknown> = {};

  if (queryFilters.service) {
    filters.service_id = queryFilters.service;
  }

  const { filter, sort, skip, limit } = buildQuery({
    ...options,
    filters,
    activeOnly: true,
    searchFields: ["name", "service_name"],
  });

  const [data, total] = await Promise.all([
    Doctor.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Doctor.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(total, options) };
};

export const getDoctorById = async (id: string) => {
  const doctor = await Doctor.findOne({ _id: id, is_active: true }).lean();

  if (!doctor) {
    throw ApiError.notFound("Doctor");
  }

  return doctor;
};
