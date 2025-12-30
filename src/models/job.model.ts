import mongoose, { Schema, Document } from "mongoose";
import { TranslatedField } from "@shared/types/i18n.types";

const translatedFieldSchema = {
  fr: { type: String, required: true },
  en: { type: String, default: "" },
  de: { type: String, default: "" },
  it: { type: String, default: "" },
};

// ── Interface ──
export interface IJob extends Document {
  title: TranslatedField;
  job_id: string;
  url: string;
  category: string;
  percentage: string;
  description: TranslatedField | null;
  requirements: TranslatedField[];
  site: string | null;
  department: string | null;
  published_date: string | null;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ──
const jobSchema = new Schema<IJob>(
  {
    title: {
      type: translatedFieldSchema,
      required: [true, "Job title is required"],
    },
    job_id: {
      type: String,
      required: [true, "Job ID is required"],
      unique: true,
      trim: true,
      index: true,
    },
    url: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "all",
      trim: true,
      index: true,
    },
    percentage: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: translatedFieldSchema,
      default: null,
    },
    requirements: {
      type: [translatedFieldSchema],
      default: [],
    },
    site: {
      type: String,
      default: null,
      trim: true,
    },
    department: {
      type: String,
      default: null,
      trim: true,
    },
    published_date: {
      type: String,
      default: null,
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
jobSchema.index({ "title.fr": "text", "title.en": "text", category: 1 });
jobSchema.index({ category: 1, is_active: 1 });

export const Job = mongoose.model<IJob>("Job", jobSchema);
