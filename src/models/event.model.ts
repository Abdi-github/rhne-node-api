import mongoose, { Schema, Document } from "mongoose";
import { TranslatedField } from "@shared/types/i18n.types";

const translatedFieldSchema = {
  fr: { type: String, required: true },
  en: { type: String, default: "" },
  de: { type: String, default: "" },
  it: { type: String, default: "" },
};

// ── Interface ──
export interface IEvent extends Document {
  title: TranslatedField;
  slug: string;
  url: string;
  date: string;
  time: TranslatedField | null;
  location: TranslatedField | null;
  category: TranslatedField | null;
  description: TranslatedField | null;
  detail_url: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ──
const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: translatedFieldSchema,
      required: [true, "Event title is required"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    url: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      required: [true, "Event date is required"],
    },
    time: {
      type: translatedFieldSchema,
      default: null,
    },
    location: {
      type: translatedFieldSchema,
      default: null,
    },
    category: {
      type: translatedFieldSchema,
      default: null,
    },
    description: {
      type: translatedFieldSchema,
      default: null,
    },
    detail_url: {
      type: String,
      default: "",
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──
eventSchema.index({ date: 1, is_active: 1 });
eventSchema.index({ "title.fr": "text", "title.en": "text" });

export const Event = mongoose.model<IEvent>("Event", eventSchema);
