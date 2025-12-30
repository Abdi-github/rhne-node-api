import mongoose, { Schema, Document, Types } from "mongoose";

// ── Interface ──
export interface IDoctor extends Document {
  name: string;
  title: string | null;
  service_id: Types.ObjectId;
  service_name: string;
  image_url: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ──
const doctorSchema = new Schema<IDoctor>(
  {
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
      maxlength: [200, "Doctor name cannot exceed 200 characters"],
    },
    title: {
      type: String,
      default: null,
      trim: true,
      enum: {
        values: [null, "Dr", "Dre", "Pr", "Pre", "Prof"],
        message: "Invalid title. Must be Dr, Dre, Pr, Pre, or Prof",
      },
    },
    service_id: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service ID is required"],
      index: true,
    },
    service_name: {
      type: String,
      default: "",
      trim: true,
    },
    image_url: {
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
doctorSchema.index({ name: "text", service_name: "text" });
doctorSchema.index({ service_id: 1, is_active: 1 });

export const Doctor = mongoose.model<IDoctor>("Doctor", doctorSchema);
