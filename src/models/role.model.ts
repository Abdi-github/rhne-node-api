import mongoose, { Schema, Document } from "mongoose";
import { TranslatedField } from "@shared/types/i18n.types";

const translatedFieldSchema = {
  fr: { type: String, required: true },
  en: { type: String, default: "" },
  de: { type: String, default: "" },
  it: { type: String, default: "" },
};

// ── Interface ──
export interface IRole extends Document {
  name: string;
  display_name: TranslatedField;
  description: TranslatedField;
  is_system: boolean;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ──
const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z_]+$/, "Role name must contain only lowercase letters and underscores"],
      index: true,
    },
    display_name: {
      type: translatedFieldSchema,
      required: [true, "Display name is required"],
    },
    description: {
      type: translatedFieldSchema,
      required: [true, "Description is required"],
    },
    is_system: {
      type: Boolean,
      default: false,
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

export const Role = mongoose.model<IRole>("Role", roleSchema);
