import mongoose, { Schema, Document } from "mongoose";

// ── Interface ──
export interface INewborn extends Document {
  name: string;
  date: string;
  image_url: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ──
const newbornSchema = new Schema<INewborn>(
  {
    name: {
      type: String,
      required: [true, "Newborn name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    image_url: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──
newbornSchema.index({ date: 1 });
newbornSchema.index({ name: "text" });

export const Newborn = mongoose.model<INewborn>("Newborn", newbornSchema);
