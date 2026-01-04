import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format")
      .toLowerCase()
      .trim(),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refresh_token: z
      .string({ required_error: "Refresh token is required" })
      .min(1, "Refresh token is required"),
  }),
});

export const logoutSchema = z.object({
  body: z.object({
    refresh_token: z
      .string({ required_error: "Refresh token is required" })
      .min(1, "Refresh token is required"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format")
      .toLowerCase()
      .trim(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z
      .string({ required_error: "Reset token is required" })
      .min(1, "Reset token is required"),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
        "Password must contain uppercase, lowercase, number, and special character"
      ),
    password_confirm: z
      .string({ required_error: "Password confirmation is required" }),
  }).refine((data) => data.password === data.password_confirm, {
    message: "Passwords do not match",
    path: ["password_confirm"],
  }),
});
