import { z } from "zod";
import {
  translatedFieldSchema,
  optionalTranslatedFieldSchema,
  objectIdSchema,
} from "@shared/utils/zod-schemas";

const conditionsSchema = z.array(translatedFieldSchema).optional().default([]);

export const createAppointmentSchema = z.object({
  body: z.object({
    title: translatedFieldSchema,
    appointment_type: z.enum(["adult", "child", "doctor"]),
    description: optionalTranslatedFieldSchema,
    age_restriction: optionalTranslatedFieldSchema,
    schedule: optionalTranslatedFieldSchema,
    locations: optionalTranslatedFieldSchema,
    booking_url: z.string().optional().default(""),
    info_text: optionalTranslatedFieldSchema,
    conditions: conditionsSchema,
    phone_number: z.string().optional().default(""),
    display_order: z.number().int().min(0).optional().default(0),
    is_active: z.boolean().optional().default(true),
  }),
});

export const updateAppointmentSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    title: translatedFieldSchema.optional(),
    appointment_type: z.enum(["adult", "child", "doctor"]).optional(),
    description: optionalTranslatedFieldSchema,
    age_restriction: optionalTranslatedFieldSchema,
    schedule: optionalTranslatedFieldSchema,
    locations: optionalTranslatedFieldSchema,
    booking_url: z.string().optional(),
    info_text: optionalTranslatedFieldSchema,
    conditions: conditionsSchema,
    phone_number: z.string().optional(),
    display_order: z.number().int().min(0).optional(),
    is_active: z.boolean().optional(),
  }),
});
