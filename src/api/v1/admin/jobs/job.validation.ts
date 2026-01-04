import { z } from "zod";
import { translatedFieldSchema, optionalTranslatedFieldSchema, objectIdSchema } from "@shared/utils/zod-schemas";

export const createJobSchema = z.object({
  body: z.object({
    title: translatedFieldSchema,
    job_id: z.string().min(1, "Job ID is required"),
    url: z.string().optional().default(""),
    category: z.string().optional().default("all"),
    percentage: z.string().optional().default(""),
    description: optionalTranslatedFieldSchema,
    requirements: z.array(translatedFieldSchema).optional().default([]),
    site: z.string().nullable().optional().default(null),
    department: z.string().nullable().optional().default(null),
    published_date: z.string().nullable().optional().default(null),
    is_active: z.boolean().optional().default(true),
  }),
});

export const updateJobSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    title: translatedFieldSchema.optional(),
    job_id: z.string().optional(),
    url: z.string().optional(),
    category: z.string().optional(),
    percentage: z.string().optional(),
    description: optionalTranslatedFieldSchema,
    requirements: z.array(translatedFieldSchema).optional(),
    site: z.string().nullable().optional(),
    department: z.string().nullable().optional(),
    published_date: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
  }),
});
