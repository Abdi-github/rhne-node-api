import mongoose, { Schema, Document, Types } from "mongoose";
import { TranslatedField } from "@shared/types/i18n.types";

const translatedFieldSchema = {
  fr: { type: String, required: true },
  en: { type: String, default: "" },
  de: { type: String, default: "" },
  it: { type: String, default: "" },
};

// ── Interface ──
export interface IServiceLink extends Document {
  service_id: Types.ObjectId;
  title: TranslatedField;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ──
const serviceLinkSchema = new Schema<IServiceLink>(
  {
    service_id: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service ID is required"],
      index: true,
    },
    title: {
      type: translatedFieldSchema,
      required: [true, "Link title is required"],
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ServiceLink = mongoose.model<IServiceLink>("ServiceLink", serviceLinkSchema);
