import mongoose, { Schema, Document, Types } from "mongoose";

// ── Interface ──
export interface IUserRole extends Document {
  user_id: Types.ObjectId;
  role_id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ──
const userRoleSchema = new Schema<IUserRole>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    role_id: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: [true, "Role ID is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──
userRoleSchema.index({ user_id: 1, role_id: 1 }, { unique: true });

export const UserRole = mongoose.model<IUserRole>("UserRole", userRoleSchema);
