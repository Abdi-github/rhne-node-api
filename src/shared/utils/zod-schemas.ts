import { z } from "zod";

// ── Reusable Zod schemas ──

export const translatedFieldSchema = z.object({
  fr: z.string().min(1, "French translation is required"),
  en: z.string().default(""),
  de: z.string().default(""),
  it: z.string().default(""),
});

export const optionalTranslatedFieldSchema = z
  .object({
    fr: z.string(),
    en: z.string().default(""),
    de: z.string().default(""),
    it: z.string().default(""),
  })
  .nullable()
  .optional();

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sort: z.string().optional(),
  search: z.string().optional(),
  is_active: z.enum(["true", "false"]).optional(),
});

export const idParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
