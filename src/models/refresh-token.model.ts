import mongoose, { Schema, Document, Types } from "mongoose";

// ── Interface ──
export interface IRefreshToken extends Document {
  user_id: Types.ObjectId;
  token: string;
  expires_at: Date;
  is_revoked: boolean;
  created_by_ip: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ──
const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    token: {
      type: String,
      required: [true, "Token is required"],
      unique: true,
      index: true,
    },
    expires_at: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    is_revoked: {
      type: Boolean,
      default: false,
    },
    created_by_ip: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──
refreshTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ user_id: 1, is_revoked: 1 });

export const RefreshToken = mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);
