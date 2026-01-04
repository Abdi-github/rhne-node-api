import { z } from "zod";
import { translatedFieldSchema, optionalTranslatedFieldSchema } from "@shared/utils/zod-schemas";

export const createSiteSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(200),
    type: translatedFieldSchema,
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    postal_code: z.string().regex(/^\d{4}$/, "Postal code must be 4 digits"),
    phone: z.string().min(1, "Phone is required"),
    maps_url: z.string().optional().default(""),
    image_url: z.string().optional().default(""),
    description: optionalTranslatedFieldSchema,
    amenities: z.array(translatedFieldSchema).optional().default([]),
    is_active: z.boolean().optional().default(true),
  }),
});

export const updateSiteSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID"),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    type: translatedFieldSchema.optional(),
    address: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    postal_code: z.string().regex(/^\d{4}$/).optional(),
    phone: z.string().min(1).optional(),
    maps_url: z.string().optional(),
    image_url: z.string().optional(),
    description: optionalTranslatedFieldSchema,
    amenities: z.array(translatedFieldSchema).optional(),
    is_active: z.boolean().optional(),
  }),
});
