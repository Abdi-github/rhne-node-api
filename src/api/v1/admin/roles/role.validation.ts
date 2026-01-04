import { z } from "zod";
import {
  translatedFieldSchema,
  objectIdSchema,
} from "@shared/utils/zod-schemas";

export const createRoleSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Role name is required")
      .max(50)
      .regex(/^[a-z_]+$/, "Name must contain only lowercase letters and underscores"),
    display_name: translatedFieldSchema,
    description: translatedFieldSchema,
    is_active: z.boolean().optional().default(true),
  }),
});

export const updateRoleSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    name: z
      .string()
      .min(1)
      .max(50)
      .regex(/^[a-z_]+$/, "Name must contain only lowercase letters and underscores")
      .optional(),
    display_name: translatedFieldSchema.optional(),
    description: translatedFieldSchema.optional(),
    is_active: z.boolean().optional(),
  }),
});

export const assignPermissionsSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    permission_ids: z.array(objectIdSchema),
  }),
});
