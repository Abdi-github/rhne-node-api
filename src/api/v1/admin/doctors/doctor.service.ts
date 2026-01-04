import { Doctor } from "@models/doctor.model";
import { Service } from "@models/service.model";
import { buildQuery } from "@shared/utils/query-builder";
import { buildPagination } from "@shared/utils/pagination";
import { ApiError } from "@shared/utils/api-error";
import type { PaginationOptions } from "@shared/types/common.types";

export const getAll = async (options: PaginationOptions, isActive?: string) => {
  const { filter, sort, skip, limit } = buildQuery({
    ...options,
    activeOnly: false,
    searchFields: ["name", "service_name"],
  });

  if (isActive !== undefined) filter.is_active = isActive === "true";

  const [data, total] = await Promise.all([
    Doctor.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Doctor.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(total, options) };
};

export const getById = async (id: string) => {
  const doctor = await Doctor.findById(id).lean();
  if (!doctor) throw ApiError.notFound("Doctor");
  return doctor;
};

export const create = async (data: Record<string, unknown>) => {
  // Validate service exists
  if (data.service_id) {
    const service = await Service.findById(data.service_id);
    if (!service) throw ApiError.notFound("Service");
    if (!data.service_name) {
      data.service_name = service.name.fr;
    }
  }

  const doctor = await Doctor.create(data);
  return doctor.toObject();
};

export const update = async (id: string, data: Record<string, unknown>) => {
  if (data.service_id) {
    const service = await Service.findById(data.service_id);
    if (!service) throw ApiError.notFound("Service");
  }

  const doctor = await Doctor.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!doctor) throw ApiError.notFound("Doctor");
  return doctor;
};

export const softDelete = async (id: string) => {
  const doctor = await Doctor.findByIdAndUpdate(id, { is_active: false }, { new: true }).lean();
  if (!doctor) throw ApiError.notFound("Doctor");
  return doctor;
};
