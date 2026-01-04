import { z } from "zod";
import { translatedFieldSchema, optionalTranslatedFieldSchema, objectIdSchema } from "@shared/utils/zod-schemas";

export const createServiceSchema = z.object({
  body: z.object({
    name: translatedFieldSchema,
    category: z.string().nullable().optional().default(null),
    image_url: z.string().optional().default(""),
    description: optionalTranslatedFieldSchema,
    prestations: z.array(translatedFieldSchema).optional().default([]),
    is_active: z.boolean().optional().default(true),
  }),
});

export const updateServiceSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    name: translatedFieldSchema.optional(),
    category: z.string().nullable().optional(),
    image_url: z.string().optional(),
    description: optionalTranslatedFieldSchema,
    prestations: z.array(translatedFieldSchema).optional(),
    is_active: z.boolean().optional(),
  }),
});

export const createServiceContactSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    site_id: objectIdSchema.nullable().optional().default(null),
    site_name: z.string().optional().default(""),
    email: z.string().email().optional().default(""),
    phone: z.string().optional().default(""),
    hours: optionalTranslatedFieldSchema,
  }),
});

export const updateServiceContactSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    site_id: objectIdSchema.nullable().optional(),
    site_name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    hours: optionalTranslatedFieldSchema,
  }),
});

export const createServiceLinkSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    title: translatedFieldSchema,
    url: z.string().url("Invalid URL"),
  }),
});

export const updateServiceLinkSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    title: translatedFieldSchema.optional(),
    url: z.string().url("Invalid URL").optional(),
  }),
});
