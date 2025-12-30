import mongoose, { Schema, Document } from "mongoose";
import { TranslatedField } from "@shared/types/i18n.types";

const translatedFieldSchema = {
  fr: { type: String, required: true },
  en: { type: String, default: "" },
  de: { type: String, default: "" },
  it: { type: String, default: "" },
};

// ── Interface ──
export interface IService extends Document {
  name: TranslatedField;
  slug: string;
  category: string | null;
  image_url: string;
  description: TranslatedField | null;
  prestations: TranslatedField[];
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ──
const serviceSchema = new Schema<IService>(
  {
    name: {
      type: translatedFieldSchema,
      required: [true, "Service name is required"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    image_url: {
      type: String,
      default: "",
    },
    description: {
      type: translatedFieldSchema,
      default: null,
    },
    prestations: {
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
serviceSchema.index({ "name.fr": "text", "name.en": "text", category: 1 });

// ── Virtuals ──
serviceSchema.virtual("contacts", {
  ref: "ServiceContact",
  localField: "_id",
  foreignField: "service_id",
});

serviceSchema.virtual("links", {
  ref: "ServiceLink",
  localField: "_id",
  foreignField: "service_id",
});

serviceSchema.virtual("brochures", {
  ref: "ServiceBrochure",
  localField: "_id",
  foreignField: "service_id",
});

serviceSchema.virtual("doctors", {
  ref: "Doctor",
  localField: "_id",
  foreignField: "service_id",
});

export const Service = mongoose.model<IService>("Service", serviceSchema);
