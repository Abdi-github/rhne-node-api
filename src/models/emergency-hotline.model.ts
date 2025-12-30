import mongoose, { Schema, Document } from "mongoose";
import { TranslatedField } from "@shared/types/i18n.types";

const translatedFieldSchema = {
  fr: { type: String, required: true },
  en: { type: String, default: "" },
  de: { type: String, default: "" },
  it: { type: String, default: "" },
};

// ── Interface ──
export interface IEmergencyHotline extends Document {
  title: TranslatedField;
  slug: string;
  subtitle: TranslatedField | null;
  hotline_type: "vital" | "non_vital" | "psychiatric" | "appointment";
  phone_number: string;
  description: TranslatedField | null;
  icon: string;
  color: string;
  link_url: string;
  display_order: number;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ──
const emergencyHotlineSchema = new Schema<IEmergencyHotline>(
  {
    title: {
      type: translatedFieldSchema,
      required: [true, "Title is required"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    subtitle: { type: translatedFieldSchema, default: null },
    hotline_type: {
      type: String,
      required: [true, "Hotline type is required"],
      enum: ["vital", "non_vital", "psychiatric", "appointment"],
      index: true,
    },
    phone_number: { type: String, default: "" },
    description: { type: translatedFieldSchema, default: null },
    icon: { type: String, default: "Phone" },
    color: { type: String, default: "#d32f2f" },
    link_url: { type: String, default: "" },
    display_order: { type: Number, default: 0, index: true },
    is_active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

emergencyHotlineSchema.index({ display_order: 1, is_active: 1 });
emergencyHotlineSchema.index({ "title.fr": "text", "title.en": "text" });

export const EmergencyHotline = mongoose.model<IEmergencyHotline>(
  "EmergencyHotline",
  emergencyHotlineSchema
);
