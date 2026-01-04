import { AppointmentBooking } from "@models/appointment-booking.model";
import { buildQuery } from "@shared/utils/query-builder";
import { buildPagination } from "@shared/utils/pagination";
import { ApiError } from "@shared/utils/api-error";
import type { PaginationOptions } from "@shared/types/common.types";

export const getAll = async (
  options: PaginationOptions,
  filters: {
    status?: string;
    appointment_type?: string;
    date_from?: string;
    date_to?: string;
  }
) => {
  const { filter, sort, skip, limit } = buildQuery({
    ...options,
    activeOnly: false,
    searchFields: [
      "booking_reference",
      "patient_info.first_name",
      "patient_info.last_name",
      "patient_info.email",
    ],
  });

  if (filters.status) filter.status = filters.status;
  if (filters.appointment_type) filter.appointment_type = filters.appointment_type;

  if (filters.date_from || filters.date_to) {
    filter.preferred_date = {};
    if (filters.date_from) filter.preferred_date.$gte = new Date(filters.date_from);
    if (filters.date_to) filter.preferred_date.$lte = new Date(filters.date_to);
  }

  const defaultSort =
    Object.keys(sort).length > 0 ? sort : ({ createdAt: -1 } as const);

  const [data, total] = await Promise.all([
    AppointmentBooking.find(filter)
      .sort(defaultSort)
      .skip(skip)
      .limit(limit)
      .populate("appointment_id", "title appointment_type")
      .populate("site_id", "name city")
      .populate("confirmed_by", "first_name last_name email")
      .lean(),
    AppointmentBooking.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(total, options) };
};

export const getById = async (id: string) => {
  const booking = await AppointmentBooking.findById(id)
    .populate("appointment_id", "title appointment_type")
    .populate("site_id", "name city")
    .populate("confirmed_by", "first_name last_name email")
    .lean();
  if (!booking) throw ApiError.notFound("Appointment booking");
  return booking;
};

export const updateStatus = async (
  id: string,
  status: string,
  userId: string,
  notes?: string
) => {
  const booking = await AppointmentBooking.findById(id);
  if (!booking) throw ApiError.notFound("Appointment booking");

  const validTransitions: Record<string, string[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["completed", "cancelled", "no_show"],
    cancelled: [],
    completed: [],
    no_show: [],
  };

  const allowed = validTransitions[booking.status] || [];
  if (!allowed.includes(status)) {
    throw ApiError.badRequest(
      `Cannot transition from "${booking.status}" to "${status}"`
    );
  }

  booking.status = status as typeof booking.status;
  if (notes) booking.notes = notes;

  if (status === "confirmed") {
    booking.confirmed_by = userId as unknown as typeof booking.confirmed_by;
    booking.confirmed_at = new Date();
  } else if (status === "cancelled") {
    booking.cancelled_at = new Date();
  }

  await booking.save();

  return AppointmentBooking.findById(id)
    .populate("appointment_id", "title appointment_type")
    .populate("site_id", "name city")
    .populate("confirmed_by", "first_name last_name email")
    .lean();
};

export const remove = async (id: string) => {
  const booking = await AppointmentBooking.findByIdAndDelete(id).lean();
  if (!booking) throw ApiError.notFound("Appointment booking");
  return booking;
};
