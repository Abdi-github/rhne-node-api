import mongoose, { Schema, Document, Types } from "mongoose";

// ── Interface ──
export interface IRolePermission extends Document {
  role_id: Types.ObjectId;
  permission_id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ──
const rolePermissionSchema = new Schema<IRolePermission>(
  {
    role_id: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: [true, "Role ID is required"],
      index: true,
    },
    permission_id: {
      type: Schema.Types.ObjectId,
      ref: "Permission",
      required: [true, "Permission ID is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──
rolePermissionSchema.index({ role_id: 1, permission_id: 1 }, { unique: true });

export const RolePermission = mongoose.model<IRolePermission>(
  "RolePermission",
  rolePermissionSchema
);
