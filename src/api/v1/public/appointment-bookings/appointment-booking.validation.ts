import { z } from "zod";
import { objectIdSchema } from "@shared/utils/zod-schemas";

export const createBookingSchema = z.object({
  body: z.object({
    appointment_id: objectIdSchema,
    site_id: objectIdSchema.optional(),
    preferred_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    preferred_time_slot: z.string().min(1, "Time slot is required"),
    reason: z.string().min(1, "Reason is required").max(500),
    symptoms: z.array(z.string().max(200)).optional().default([]),
    patient_info: z.object({
      first_name: z.string().min(1, "First name is required").max(100),
      last_name: z.string().min(1, "Last name is required").max(100),
      email: z.string().email("Valid email is required"),
      phone: z.string().min(1, "Phone is required").max(20),
      date_of_birth: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be YYYY-MM-DD"),
    }),
  }),
});

export const getBookingByReferenceSchema = z.object({
  params: z.object({
    reference: z.string().min(1, "Reference is required"),
  }),
});

export const cancelBookingSchema = z.object({
  params: z.object({
    reference: z.string().min(1, "Reference is required"),
  }),
  body: z.object({
    reason: z.string().max(500).optional().default(""),
  }),
});

export const getAvailableSlotsSchema = z.object({
  query: z.object({
    appointment_type: z.enum(["adult", "child", "doctor"]),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    site_id: objectIdSchema.optional(),
  }),
});
