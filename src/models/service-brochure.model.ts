import mongoose, { Schema, Document, Types } from "mongoose";
import { TranslatedField } from "@shared/types/i18n.types";

const translatedFieldSchema = {
  fr: { type: String, required: true },
  en: { type: String, default: "" },
  de: { type: String, default: "" },
  it: { type: String, default: "" },
};

// ── Interface ──
export interface IServiceBrochure extends Document {
  service_id: Types.ObjectId;
  title: TranslatedField;
  date: string;
  download_url: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ──
const serviceBrochureSchema = new Schema<IServiceBrochure>(
  {
    service_id: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service ID is required"],
      index: true,
    },
    title: {
      type: translatedFieldSchema,
      required: [true, "Brochure title is required"],
    },
    date: {
      type: String,
      default: "",
    },
    download_url: {
      type: String,
      required: [true, "Download URL is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ServiceBrochure = mongoose.model<IServiceBrochure>(
  "ServiceBrochure",
  serviceBrochureSchema
);
