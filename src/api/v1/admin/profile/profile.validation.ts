import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

export const updateProfileSchema = z.object({
  body: z.object({
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().min(1).max(100).optional(),
    phone: z.string().optional(),
    preferred_language: z.enum(["fr", "en", "de", "it"]).optional(),
    avatar_url: z.string().nullable().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      current_password: z.string().min(1, "Current password is required"),
      new_password: z
        .string()
        .min(8, "New password must be at least 8 characters")
        .regex(passwordRegex, "Password must contain uppercase, lowercase, number, and special character"),
      confirm_password: z.string().min(1, "Confirm password is required"),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: "Passwords do not match",
      path: ["confirm_password"],
    }),
});
