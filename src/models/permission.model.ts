import mongoose, { Schema, Document } from "mongoose";

// ── Interface ──
export interface IPermission extends Document {
  name: string;
  display_name: string;
  description: string;
  resource: string;
  action: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ──
const permissionSchema = new Schema<IPermission>(
  {
    name: {
      type: String,
      required: [true, "Permission name is required"],
      unique: true,
      trim: true,
      index: true,
    },
    display_name: {
      type: String,
      required: [true, "Display name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    resource: {
      type: String,
      required: [true, "Resource is required"],
      trim: true,
      index: true,
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
      enum: {
        values: ["read", "create", "update", "delete"],
        message: "Action must be read, create, update, or delete",
      },
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──
permissionSchema.index({ resource: 1, action: 1 });

export const Permission = mongoose.model<IPermission>("Permission", permissionSchema);
