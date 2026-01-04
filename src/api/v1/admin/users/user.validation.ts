import { z } from "zod";
import { objectIdSchema } from "@shared/utils/zod-schemas";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(passwordRegex, "Password must contain uppercase, lowercase, number, and special character"),
    first_name: z.string().min(1, "First name is required").max(100),
    last_name: z.string().min(1, "Last name is required").max(100),
    phone: z.string().optional().default(""),
    preferred_language: z.enum(["fr", "en", "de", "it"]).optional().default("fr"),
    user_type: z.enum(["admin", "staff"]).optional().default("staff"),
    site_id: objectIdSchema.nullable().optional().default(null),
    avatar_url: z.string().nullable().optional().default(null),
    is_active: z.boolean().optional().default(true),
    is_verified: z.boolean().optional().default(false),
    roles: z.array(objectIdSchema).optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    email: z.string().email("Invalid email").optional(),
    password: z
      .string()
      .min(8)
      .regex(passwordRegex, "Password must contain uppercase, lowercase, number, and special character")
      .optional(),
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().min(1).max(100).optional(),
    phone: z.string().optional(),
    preferred_language: z.enum(["fr", "en", "de", "it"]).optional(),
    user_type: z.enum(["admin", "staff"]).optional(),
    site_id: objectIdSchema.nullable().optional(),
    avatar_url: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
    is_verified: z.boolean().optional(),
    roles: z.array(objectIdSchema).optional(),
  }),
});

export const assignRolesSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    role_ids: z.array(objectIdSchema).min(1, "At least one role is required"),
  }),
});
