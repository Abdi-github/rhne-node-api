import mongoose, { Schema, Document } from "mongoose";
import { TranslatedField } from "@shared/types/i18n.types";

const translatedFieldSchema = {
  fr: { type: String, required: true },
  en: { type: String, default: "" },
  de: { type: String, default: "" },
  it: { type: String, default: "" },
};

// ── Interface ──
export interface IAppointment extends Document {
  title: TranslatedField;
  slug: string;
  appointment_type: "adult" | "child" | "doctor";
  description: TranslatedField | null;
  age_restriction: TranslatedField | null;
  schedule: TranslatedField | null;
  locations: TranslatedField | null;
  booking_url: string;
  info_text: TranslatedField | null;
  conditions: TranslatedField[];
  phone_number: string;
  display_order: number;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ──
const appointmentSchema = new Schema<IAppointment>(
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
    appointment_type: {
      type: String,
      required: [true, "Appointment type is required"],
      enum: ["adult", "child", "doctor"],
      index: true,
    },
    description: { type: translatedFieldSchema, default: null },
    age_restriction: { type: translatedFieldSchema, default: null },
    schedule: { type: translatedFieldSchema, default: null },
    locations: { type: translatedFieldSchema, default: null },
    booking_url: { type: String, default: "" },
    info_text: { type: translatedFieldSchema, default: null },
    conditions: [{ type: translatedFieldSchema }],
    phone_number: { type: String, default: "" },
    display_order: { type: Number, default: 0, index: true },
    is_active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

appointmentSchema.index({ display_order: 1, is_active: 1 });
appointmentSchema.index({ "title.fr": "text", "title.en": "text" });

export const Appointment = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema
);
