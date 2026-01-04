import { z } from "zod";
import { objectIdSchema } from "@shared/utils/zod-schemas";

export const createNewbornSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(200),
    date: z.string().min(1, "Date is required"),
    image_url: z.string().optional().default(""),
  }),
});

export const updateNewbornSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    date: z.string().optional(),
    image_url: z.string().optional(),
  }),
});
