import { Appointment } from "@models/appointment.model";
import { buildQuery } from "@shared/utils/query-builder";
import { buildPagination } from "@shared/utils/pagination";
import { ApiError } from "@shared/utils/api-error";
import type { PaginationOptions } from "@shared/types/common.types";

export const getAllAppointments = async (options: PaginationOptions) => {
  const { filter, sort, skip, limit } = buildQuery({
    ...options,
    activeOnly: true,
    searchFields: ["title.fr", "title.en", "title.de", "title.it"],
  });

  const effectiveSort = Object.keys(sort).length > 0 ? sort : { display_order: 1 as const };

  const [data, total] = await Promise.all([
    Appointment.find(filter).sort(effectiveSort).skip(skip).limit(limit).lean(),
    Appointment.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(total, options) };
};

export const getAppointmentBySlug = async (slug: string) => {
  const appointment = await Appointment.findOne({ slug, is_active: true }).lean();
  if (!appointment) throw ApiError.notFound("Appointment");
  return appointment;
};
