import mongoose, { Schema, Document, Types } from "mongoose";

// ── Interface ──
export interface IAppointmentBooking extends Document {
  booking_reference: string;
  appointment_id: Types.ObjectId;
  appointment_type: "adult" | "child" | "doctor";
  patient_info: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
  };
  site_id: Types.ObjectId | null;
  site_name: string;
  preferred_date: string;
  preferred_time_slot: string;
  reason: string;
  symptoms: string[];
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  notes: string;
  confirmed_by: Types.ObjectId | null;
  confirmed_at: Date | null;
  cancelled_at: Date | null;
  cancellation_reason: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ──
const appointmentBookingSchema = new Schema<IAppointmentBooking>(
  {
    booking_reference: {
      type: String,
      required: [true, "Booking reference is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    appointment_id: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: [true, "Appointment ID is required"],
      index: true,
    },
    appointment_type: {
      type: String,
      required: [true, "Appointment type is required"],
      enum: ["adult", "child", "doctor"],
      index: true,
    },
    patient_info: {
      first_name: {
        type: String,
        required: [true, "Patient first name is required"],
        trim: true,
      },
      last_name: {
        type: String,
        required: [true, "Patient last name is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Patient email is required"],
        lowercase: true,
        trim: true,
      },
      phone: {
        type: String,
        required: [true, "Patient phone is required"],
        trim: true,
      },
      date_of_birth: {
        type: String,
        required: [true, "Date of birth is required"],
      },
    },
    site_id: {
      type: Schema.Types.ObjectId,
      ref: "Site",
      default: null,
      index: true,
    },
    site_name: {
      type: String,
      default: "",
      trim: true,
    },
    preferred_date: {
      type: String,
      required: [true, "Preferred date is required"],
    },
    preferred_time_slot: {
      type: String,
      required: [true, "Time slot is required"],
      trim: true,
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
    },
    symptoms: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "confirmed", "cancelled", "completed", "no_show"],
      index: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    confirmed_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    confirmed_at: {
      type: Date,
      default: null,
    },
    cancelled_at: {
      type: Date,
      default: null,
    },
    cancellation_reason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──
appointmentBookingSchema.index({ status: 1, preferred_date: 1 });
appointmentBookingSchema.index({ "patient_info.email": 1 });
appointmentBookingSchema.index({ createdAt: -1 });

// ── Generate booking reference ──
export const generateBookingReference = (): string => {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RDV-${dateStr}-${code}`;
};

export const AppointmentBooking = mongoose.model<IAppointmentBooking>(
  "AppointmentBooking",
  appointmentBookingSchema
);
