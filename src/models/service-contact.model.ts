import mongoose, { Schema, Document, Types } from "mongoose";
import { TranslatedField } from "@shared/types/i18n.types";

const translatedFieldSchema = {
  fr: { type: String, required: true },
  en: { type: String, default: "" },
  de: { type: String, default: "" },
  it: { type: String, default: "" },
};

// ── Interface ──
export interface IServiceContact extends Document {
  service_id: Types.ObjectId;
  site_id: Types.ObjectId | null;
  site_name: string;
  email: string;
  phone: string;
  hours: TranslatedField | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ──
const serviceContactSchema = new Schema<IServiceContact>(
  {
    service_id: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service ID is required"],
      index: true,
    },
    site_id: {
      type: Schema.Types.ObjectId,
      ref: "Site",
      default: null,
      index: true,
    },
    site_name: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    hours: {
      type: translatedFieldSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──
serviceContactSchema.index({ service_id: 1, site_id: 1 });

export const ServiceContact = mongoose.model<IServiceContact>(
  "ServiceContact",
  serviceContactSchema
);
