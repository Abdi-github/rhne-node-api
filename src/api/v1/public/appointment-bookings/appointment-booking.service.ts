import {
  AppointmentBooking,
  generateBookingReference,
} from "@models/appointment-booking.model";
import { Appointment } from "@models/appointment.model";
import { Site } from "@models/site.model";
import { ApiError } from "@shared/utils/api-error";
import {
  enqueueBookingConfirmation,
  enqueueStaffNotification,
} from "@shared/notifications/notification.service";
import { env } from "@config/env";

interface CreateBookingData {
  appointment_id: string;
  site_id?: string;
  preferred_date: string;
  preferred_time_slot: string;
  reason: string;
  symptoms?: string[];
  patient_info: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
  };
}

export const createBooking = async (data: CreateBookingData) => {
  // Validate appointment exists and is active
  const appointment = await Appointment.findById(data.appointment_id).lean();
  if (!appointment || !appointment.is_active) {
    throw ApiError.notFound("Appointment type");
  }

  // Validate site if provided
  let siteName = "";
  if (data.site_id) {
    const site = await Site.findById(data.site_id).lean();
    if (!site) throw ApiError.notFound("Hospital site");
    siteName = site.name;
  }

  // Generate unique booking reference
  let bookingReference = generateBookingReference();
  let attempts = 0;
  while (
    (await AppointmentBooking.exists({ booking_reference: bookingReference })) &&
    attempts < 10
  ) {
    bookingReference = generateBookingReference();
    attempts++;
  }

  const booking = await AppointmentBooking.create({
    booking_reference: bookingReference,
    appointment_id: data.appointment_id,
    appointment_type: appointment.appointment_type,
    patient_info: data.patient_info,
    site_id: data.site_id || null,
    site_name: siteName,
    preferred_date: data.preferred_date,
    preferred_time_slot: data.preferred_time_slot,
    reason: data.reason,
    symptoms: data.symptoms || [],
    status: "pending",
  });

  const patientName = `${data.patient_info.first_name} ${data.patient_info.last_name}`;

  const appointmentTypeLabels: Record<string, string> = {
    adult: "Urgences Adulte",
    child: "Urgences Enfant & Adolescent",
    doctor: "Médecin Traitant",
  };

  // Enqueue patient confirmation email
  await enqueueBookingConfirmation({
    patientEmail: data.patient_info.email,
    patientName,
    bookingReference,
    appointmentType:
      appointmentTypeLabels[appointment.appointment_type] ||
      appointment.appointment_type,
    preferredDate: data.preferred_date,
    preferredTimeSlot: data.preferred_time_slot,
    siteName: siteName || "À déterminer",
    reason: data.reason,
  });

  // Enqueue staff notification — send to a configured staff email
  const staffEmail = env.MAIL_FROM.replace("noreply", "urgences");
  await enqueueStaffNotification({
    staffEmail: staffEmail || "urgences@rhne-clone.ch",
    patientName,
    bookingReference,
    appointmentType:
      appointmentTypeLabels[appointment.appointment_type] ||
      appointment.appointment_type,
    preferredDate: data.preferred_date,
    preferredTimeSlot: data.preferred_time_slot,
    siteName: siteName || "À déterminer",
    reason: data.reason,
    symptoms: data.symptoms || [],
  });

  return booking.toObject();
};

export const getBookingByReference = async (reference: string) => {
  const booking = await AppointmentBooking.findOne({
    booking_reference: reference.toUpperCase(),
  })
    .populate("appointment_id", "title appointment_type")
    .lean();

  if (!booking) throw ApiError.notFound("Booking");

  // Return limited info for public access (no internal notes etc.)
  return {
    _id: booking._id,
    booking_reference: booking.booking_reference,
    appointment_type: booking.appointment_type,
    patient_info: {
      first_name: booking.patient_info.first_name,
      last_name: booking.patient_info.last_name,
      email: booking.patient_info.email,
    },
    site_name: booking.site_name,
    preferred_date: booking.preferred_date,
    preferred_time_slot: booking.preferred_time_slot,
    reason: booking.reason,
    status: booking.status,
    createdAt: booking.createdAt,
  };
};

export const cancelBooking = async (
  reference: string,
  reason: string
) => {
  const booking = await AppointmentBooking.findOne({
    booking_reference: reference.toUpperCase(),
  });

  if (!booking) throw ApiError.notFound("Booking");

  if (booking.status === "cancelled") {
    throw ApiError.badRequest("This booking is already cancelled");
  }

  if (booking.status === "completed") {
    throw ApiError.badRequest("Cannot cancel a completed booking");
  }

  booking.status = "cancelled";
  booking.cancelled_at = new Date();
  booking.cancellation_reason = reason || "Cancelled by patient";
  await booking.save();

  return {
    booking_reference: booking.booking_reference,
    status: booking.status,
    cancelled_at: booking.cancelled_at,
  };
};

export const getAvailableSlots = async (
  appointmentType: string,
  date: string,
  siteId?: string
) => {
  // Define time slots based on appointment type
  const slotsByType: Record<string, { start: string; end: string }[]> = {
    adult: [
      { start: "09:00", end: "09:30" },
      { start: "09:30", end: "10:00" },
      { start: "10:00", end: "10:30" },
      { start: "10:30", end: "11:00" },
      { start: "11:00", end: "11:30" },
      { start: "11:30", end: "12:00" },
      { start: "13:30", end: "14:00" },
      { start: "14:00", end: "14:30" },
      { start: "14:30", end: "15:00" },
      { start: "15:00", end: "15:30" },
      { start: "15:30", end: "16:00" },
      { start: "16:00", end: "16:30" },
      { start: "16:30", end: "17:00" },
      { start: "17:00", end: "17:30" },
    ],
    child: [
      { start: "08:00", end: "08:30" },
      { start: "08:30", end: "09:00" },
      { start: "09:00", end: "09:30" },
      { start: "09:30", end: "10:00" },
      { start: "10:00", end: "10:30" },
      { start: "10:30", end: "11:00" },
      { start: "11:00", end: "11:30" },
      { start: "11:30", end: "12:00" },
      { start: "13:00", end: "13:30" },
      { start: "13:30", end: "14:00" },
      { start: "14:00", end: "14:30" },
      { start: "14:30", end: "15:00" },
      { start: "15:00", end: "15:30" },
      { start: "15:30", end: "16:00" },
      { start: "16:00", end: "16:30" },
      { start: "16:30", end: "17:00" },
      { start: "17:00", end: "17:30" },
      { start: "17:30", end: "18:00" },
    ],
    doctor: [
      { start: "08:30", end: "09:00" },
      { start: "09:00", end: "09:30" },
      { start: "09:30", end: "10:00" },
      { start: "10:00", end: "10:30" },
      { start: "10:30", end: "11:00" },
      { start: "11:00", end: "11:30" },
      { start: "14:00", end: "14:30" },
      { start: "14:30", end: "15:00" },
      { start: "15:00", end: "15:30" },
      { start: "15:30", end: "16:00" },
      { start: "16:00", end: "16:30" },
    ],
  };

  const allSlots = slotsByType[appointmentType] || slotsByType.adult;

  // Find already booked slots for this date/type/site
  const filter: Record<string, unknown> = {
    preferred_date: date,
    appointment_type: appointmentType,
    status: { $in: ["pending", "confirmed"] },
  };
  if (siteId) filter.site_id = siteId;

  const bookedSlots = await AppointmentBooking.find(filter)
    .select("preferred_time_slot")
    .lean();

  const bookedSet = new Set(bookedSlots.map((b) => b.preferred_time_slot));

  return allSlots.map((slot) => ({
    ...slot,
    label: `${slot.start} - ${slot.end}`,
    available: !bookedSet.has(`${slot.start} - ${slot.end}`),
  }));
};
