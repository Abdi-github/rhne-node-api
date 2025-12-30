import mongoose, { Schema, Document } from "mongoose";
import { TranslatedField } from "@shared/types/i18n.types";

// ── Translated field subdocument schema ──
const translatedFieldSchema = {
  fr: { type: String, required: true },
  en: { type: String, default: "" },
  de: { type: String, default: "" },
  it: { type: String, default: "" },
};

// ── Interface ──
export interface ISite extends Document {
  name: string;
  slug: string;
  type: TranslatedField;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  maps_url: string;
  image_url: string;
  description: TranslatedField | null;
  amenities: TranslatedField[];
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ──
const siteSchema = new Schema<ISite>(
  {
    name: {
      type: String,
      required: [true, "Site name is required"],
      trim: true,
      maxlength: [200, "Site name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: translatedFieldSchema,
      required: [true, "Site type is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    postal_code: {
      type: String,
      required: [true, "Postal code is required"],
      trim: true,
      match: [/^\d{4}$/, "Postal code must be 4 digits"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    maps_url: {
      type: String,
      default: "",
    },
    image_url: {
      type: String,
      default: "",
    },
    description: {
      type: translatedFieldSchema,
      default: null,
    },
    amenities: {
      type: [translatedFieldSchema],
      default: [],
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ──
siteSchema.index({ name: "text", city: "text" });

export const Site = mongoose.model<ISite>("Site", siteSchema);
