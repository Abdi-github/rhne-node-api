import { z } from "zod";

export const searchQuerySchema = z.object({
  query: z.object({
    q: z.string().min(1, "Search query is required"),
    lang: z.enum(["fr", "en", "de", "it"]).optional(),
    limit: z.coerce.number().min(1).max(50).optional().default(10),
    resources: z
      .string()
      .optional()
      .transform((val) => (val ? val.split(",").map((s) => s.trim()) : undefined)),
  }),
});
