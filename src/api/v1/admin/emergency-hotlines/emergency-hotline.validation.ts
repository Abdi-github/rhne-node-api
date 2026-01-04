import { z } from "zod";
import {
  translatedFieldSchema,
  optionalTranslatedFieldSchema,
  objectIdSchema,
} from "@shared/utils/zod-schemas";

export const createEmergencyHotlineSchema = z.object({
  body: z.object({
    title: translatedFieldSchema,
    hotline_type: z.enum(["vital", "non_vital", "psychiatric", "appointment"]),
    subtitle: optionalTranslatedFieldSchema,
    phone_number: z.string().optional().default(""),
    description: optionalTranslatedFieldSchema,
    icon: z.string().optional().default("Phone"),
    color: z.string().optional().default("#d32f2f"),
    link_url: z.string().optional().default(""),
    display_order: z.number().int().min(0).optional().default(0),
    is_active: z.boolean().optional().default(true),
  }),
});

export const updateEmergencyHotlineSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    title: translatedFieldSchema.optional(),
    hotline_type: z.enum(["vital", "non_vital", "psychiatric", "appointment"]).optional(),
    subtitle: optionalTranslatedFieldSchema,
    phone_number: z.string().optional(),
    description: optionalTranslatedFieldSchema,
    icon: z.string().optional(),
    color: z.string().optional(),
    link_url: z.string().optional(),
    display_order: z.number().int().min(0).optional(),
    is_active: z.boolean().optional(),
  }),
});
