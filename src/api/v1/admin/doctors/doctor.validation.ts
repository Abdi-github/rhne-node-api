import { z } from "zod";
import { objectIdSchema } from "@shared/utils/zod-schemas";

export const createDoctorSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(200),
    title: z.enum(["Dr", "Dre", "Pr", "Pre", "Prof"]).nullable().optional().default(null),
    service_id: objectIdSchema,
    service_name: z.string().optional().default(""),
    image_url: z.string().optional().default(""),
    is_active: z.boolean().optional().default(true),
  }),
});

export const updateDoctorSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    title: z.enum(["Dr", "Dre", "Pr", "Pre", "Prof"]).nullable().optional(),
    service_id: objectIdSchema.optional(),
    service_name: z.string().optional(),
    image_url: z.string().optional(),
    is_active: z.boolean().optional(),
  }),
});
