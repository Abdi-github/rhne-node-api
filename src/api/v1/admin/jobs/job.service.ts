import { Job } from "@models/job.model";
import { buildQuery } from "@shared/utils/query-builder";
import { buildPagination } from "@shared/utils/pagination";
import { ApiError } from "@shared/utils/api-error";
import type { PaginationOptions } from "@shared/types/common.types";

export const getAll = async (options: PaginationOptions, isActive?: string) => {
  const { filter, sort, skip, limit } = buildQuery({
    ...options,
    activeOnly: false,
    searchFields: ["title.fr", "title.en", "job_id", "category"],
  });

  if (isActive !== undefined) filter.is_active = isActive === "true";

  const [data, total] = await Promise.all([
    Job.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Job.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(total, options) };
};

export const getById = async (id: string) => {
  const job = await Job.findById(id).lean();
  if (!job) throw ApiError.notFound("Job");
  return job;
};

export const create = async (data: Record<string, unknown>) => {
  const existing = await Job.findOne({ job_id: data.job_id });
  if (existing) throw ApiError.conflict("A job with this ID already exists");

  const job = await Job.create(data);
  return job.toObject();
};

export const update = async (id: string, data: Record<string, unknown>) => {
  if (data.job_id) {
    const existing = await Job.findOne({ job_id: data.job_id, _id: { $ne: id } });
    if (existing) throw ApiError.conflict("A job with this ID already exists");
  }

  const job = await Job.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  if (!job) throw ApiError.notFound("Job");
  return job;
};

export const softDelete = async (id: string) => {
  const job = await Job.findByIdAndUpdate(id, { is_active: false }, { new: true }).lean();
  if (!job) throw ApiError.notFound("Job");
  return job;
};
