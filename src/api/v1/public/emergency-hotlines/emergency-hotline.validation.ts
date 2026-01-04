import { z } from "zod";

export const getEmergencyHotlineBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, "Slug is required"),
  }),
});
