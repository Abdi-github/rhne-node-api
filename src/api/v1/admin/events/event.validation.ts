import { z } from "zod";
import { translatedFieldSchema, optionalTranslatedFieldSchema, objectIdSchema } from "@shared/utils/zod-schemas";

export const createEventSchema = z.object({
  body: z.object({
    title: translatedFieldSchema,
    url: z.string().optional().default(""),
    date: z.string().min(1, "Date is required"),
    time: optionalTranslatedFieldSchema,
    location: optionalTranslatedFieldSchema,
    category: optionalTranslatedFieldSchema,
    description: optionalTranslatedFieldSchema,
    detail_url: z.string().optional().default(""),
    is_active: z.boolean().optional().default(true),
  }),
});

export const updateEventSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    title: translatedFieldSchema.optional(),
    url: z.string().optional(),
    date: z.string().optional(),
    time: optionalTranslatedFieldSchema,
    location: optionalTranslatedFieldSchema,
    category: optionalTranslatedFieldSchema,
    description: optionalTranslatedFieldSchema,
    detail_url: z.string().optional(),
    is_active: z.boolean().optional(),
  }),
});
