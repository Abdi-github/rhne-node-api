import mongoose, { Schema, Document, Types } from "mongoose";

// ── Interface ──
export interface IUser extends Document {
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone: string;
  preferred_language: string;
  user_type: string;
  site_id: Types.ObjectId | null;
  avatar_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  verified_at: Date | null;
  last_login_at: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ──
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      index: true,
    },
    password_hash: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    first_name: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [100, "First name cannot exceed 100 characters"],
    },
    last_name: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [100, "Last name cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    preferred_language: {
      type: String,
      default: "fr",
      enum: {
        values: ["fr", "en", "de", "it"],
        message: "Language must be fr, en, de, or it",
      },
    },
    user_type: {
      type: String,
      default: "staff",
      enum: {
        values: ["admin", "staff"],
        message: "User type must be admin or staff",
      },
    },
    site_id: {
      type: Schema.Types.ObjectId,
      ref: "Site",
      default: null,
      index: true,
    },
    avatar_url: {
      type: String,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    verified_at: {
      type: Date,
      default: null,
    },
    last_login_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        const { password_hash: _pw, ...rest } = ret;
        return rest;
      },
    },
    toObject: { virtuals: true },
  }
);

// ── Indexes ──
userSchema.index({ first_name: "text", last_name: "text", email: "text" });

// ── Virtual: full name ──
userSchema.virtual("full_name").get(function () {
  return `${this.first_name} ${this.last_name}`;
});

export const User = mongoose.model<IUser>("User", userSchema);
