import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import compression from "compression";
import morgan from "morgan";
import { corsOptions } from "@config/cors";
import { i18nextMiddleware, i18next } from "@config/i18n";
import { env } from "@config/env";
import { languageMiddleware } from "@middleware/language.middleware";
import { rateLimiter } from "@middleware/rate-limit.middleware";
import { notFoundHandler } from "@middleware/not-found.middleware";
import { errorHandler } from "@middleware/error.middleware";

// ── Public routes ──
import authRoutes from "@api/v1/public/auth/auth.routes";
import siteRoutes from "@api/v1/public/sites/site.routes";
import serviceRoutes from "@api/v1/public/services/service.routes";
import doctorRoutes from "@api/v1/public/doctors/doctor.routes";
import eventRoutes from "@api/v1/public/events/event.routes";
import jobRoutes from "@api/v1/public/jobs/job.routes";
import newbornRoutes from "@api/v1/public/newborns/newborn.routes";
import patientInfoRoutes from "@api/v1/public/patient-info/patient-info.routes";
import emergencyHotlineRoutes from "@api/v1/public/emergency-hotlines/emergency-hotline.routes";
import appointmentRoutes from "@api/v1/public/appointments/appointment.routes";
import appointmentBookingRoutes from "@api/v1/public/appointment-bookings/appointment-booking.routes";
import searchRoutes from "@api/v1/public/search/search.routes";

// ── Admin routes ──
import adminRoutes from "@api/v1/admin/admin.routes";

const app = express();

// ── Security ──
app.use(helmet());
app.use(hpp());
app.use(cors(corsOptions));

// ── Rate limiting ──
app.use(rateLimiter);

// ── Body parsing ──
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Compression ──
app.use(compression());

// ── Logging ──
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── i18n ──
app.use(i18nextMiddleware.handle(i18next));
app.use(languageMiddleware);

// ── Health check ──
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Root redirect ──
app.get("/", (_req, res) => {
  res.redirect(301, `/api/${env.API_VERSION}`);
});

// ── API Routes ──
const apiBase = `/api/${env.API_VERSION}`;

app.get(apiBase, (_req, res) => {
  res.json({
    success: true,
    message: "RHNe API is running",
    version: env.API_VERSION,
    documentation: "/api/v1/docs",
  });
});

// Public routes (no auth required)
app.use(`${apiBase}/auth`, authRoutes);
app.use(`${apiBase}/sites`, siteRoutes);
app.use(`${apiBase}/services`, serviceRoutes);
app.use(`${apiBase}/doctors`, doctorRoutes);
app.use(`${apiBase}/events`, eventRoutes);
app.use(`${apiBase}/jobs`, jobRoutes);
app.use(`${apiBase}/newborns`, newbornRoutes);
app.use(`${apiBase}/patient-info`, patientInfoRoutes);
app.use(`${apiBase}/emergency-hotlines`, emergencyHotlineRoutes);
app.use(`${apiBase}/appointments`, appointmentRoutes);
app.use(`${apiBase}/appointment-bookings`, appointmentBookingRoutes);
app.use(`${apiBase}/search`, searchRoutes);

// Admin routes (auth + RBAC required)
app.use(`${apiBase}/admin`, adminRoutes);

// ── 404 handler ──
app.use(notFoundHandler);

// ── Error handler ──
app.use(errorHandler);

export default app;
