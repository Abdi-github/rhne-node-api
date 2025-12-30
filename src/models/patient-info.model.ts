import mongoose, { Schema, Document } from "mongoose";
import { TranslatedField } from "@shared/types/i18n.types";

const translatedFieldSchema = {
  fr: { type: String, required: true },
  en: { type: String, default: "" },
  de: { type: String, default: "" },
  it: { type: String, default: "" },
};

// ── Section subdocument interface ──
export interface IPatientInfoSection {
  id: string;
  title: TranslatedField;
  content: TranslatedField;
  list_items: TranslatedField[];
}

// ── Interface ──
export interface IPatientInfo extends Document {
  title: TranslatedField;
  slug: string;
  url: string;
  section: string;
  sections: IPatientInfoSection[];
  content: TranslatedField | null;
  image_url: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Section subdocument schema ──
const patientInfoSectionSchema = new Schema<IPatientInfoSection>(
  {
    id: {
      type: String,
      required: [true, "Section ID is required"],
    },
    title: {
      type: translatedFieldSchema,
      required: [true, "Section title is required"],
    },
    content: {
      type: translatedFieldSchema,
      required: true,
    },
    list_items: {
      type: [translatedFieldSchema],
      default: [],
    },
  },
  {
    _id: false,
  }
);

// ── Schema ──
const patientInfoSchema = new Schema<IPatientInfo>(
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
    url: {
      type: String,
      default: "",
    },
    section: {
      type: String,
      required: [true, "Section is required"],
      trim: true,
      index: true,
    },
    sections: {
      type: [patientInfoSectionSchema],
      default: [],
    },
    content: {
      type: translatedFieldSchema,
      default: null,
    },
    image_url: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──
patientInfoSchema.index({ "title.fr": "text", "title.en": "text", section: 1 });

export const PatientInfo = mongoose.model<IPatientInfo>("PatientInfo", patientInfoSchema);
