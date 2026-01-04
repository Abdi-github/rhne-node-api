import { z } from "zod";
import { objectIdSchema } from "@shared/utils/zod-schemas";

export const updateBookingStatusSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    status: z.enum(["confirmed", "cancelled", "completed", "no_show"]),
    notes: z.string().max(1000).optional(),
  }),
});
