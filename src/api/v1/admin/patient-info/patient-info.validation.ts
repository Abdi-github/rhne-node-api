import { z } from "zod";
import { translatedFieldSchema, optionalTranslatedFieldSchema, objectIdSchema } from "@shared/utils/zod-schemas";

const sectionSchema = z.object({
  id: z.string().min(1),
  title: translatedFieldSchema,
  content: translatedFieldSchema,
  list_items: z.array(translatedFieldSchema).optional().default([]),
});

export const createPatientInfoSchema = z.object({
  body: z.object({
    title: translatedFieldSchema,
    slug: z.string().optional(),
    url: z.string().optional().default(""),
    section: z.string().optional().default(""),
    sections: z.array(sectionSchema).optional().default([]),
    content: optionalTranslatedFieldSchema,
    image_url: z.string().optional().default(""),
  }),
});

export const updatePatientInfoSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    title: translatedFieldSchema.optional(),
    slug: z.string().optional(),
    url: z.string().optional(),
    section: z.string().optional(),
    sections: z.array(sectionSchema).optional(),
    content: optionalTranslatedFieldSchema,
    image_url: z.string().optional(),
  }),
});
