import { Router } from "express";
import { authenticate } from "@middleware/auth.middleware";
import { loadUserPermissions, requirePermissions, requireRoles } from "@middleware/rbac.middleware";

// ── Admin sub-routers ──
import dashboardRoutes from "./dashboard/dashboard.routes";
import roleRoutes from "./roles/role.routes";
import permissionRoutes from "./permissions/permission.routes";
import siteRoutes from "./sites/site.routes";
import serviceRoutes, { serviceContactRouter, serviceLinkRouter } from "./services/service.routes";
import doctorRoutes from "./doctors/doctor.routes";
import eventRoutes from "./events/event.routes";
import jobRoutes from "./jobs/job.routes";
import newbornRoutes from "./newborns/newborn.routes";
import patientInfoRoutes from "./patient-info/patient-info.routes";
import emergencyHotlineRoutes from "./emergency-hotlines/emergency-hotline.routes";
import appointmentRoutes from "./appointments/appointment.routes";
import appointmentBookingRoutes from "./appointment-bookings/appointment-booking.routes";
import userRoutes from "./users/user.routes";
import profileRoutes from "./profile/profile.routes";
import uploadRoutes from "./uploads/upload.routes";

const router = Router();

// ── All admin routes require authentication + permission loading ──
router.use(authenticate, loadUserPermissions);

// ── Dashboard ──
router.use("/dashboard", dashboardRoutes);

// ── Profile (own user — no specific resource permission needed) ──
router.use("/profile", profileRoutes);

// ── Sites ──
router.use("/sites", requirePermissions("sites.read"), siteRoutes);

// ── Services ──
router.use("/services", requirePermissions("services.read"), serviceRoutes);

// ── Service Contacts (standalone /:id endpoints) ──
router.use("/service-contacts", requirePermissions("services.read"), serviceContactRouter);

// ── Service Links (standalone /:id endpoints) ──
router.use("/service-links", requirePermissions("services.read"), serviceLinkRouter);

// ── Doctors ──
router.use("/doctors", requirePermissions("doctors.read"), doctorRoutes);

// ── Events ──
router.use("/events", requirePermissions("events.read"), eventRoutes);

// ── Jobs ──
router.use("/jobs", requirePermissions("jobs.read"), jobRoutes);

// ── Newborns ──
router.use("/newborns", requirePermissions("newborns.read"), newbornRoutes);

// ── Patient Info ──
router.use("/patient-info", requirePermissions("patient_info.read"), patientInfoRoutes);

// ── Emergency Hotlines ──
router.use("/emergency-hotlines", requirePermissions("emergency_hotlines.read"), emergencyHotlineRoutes);

// ── Appointments ──
router.use("/appointments", requirePermissions("appointments.read"), appointmentRoutes);

// ── Appointment Bookings ──
router.use("/appointment-bookings", requirePermissions("appointments.read"), appointmentBookingRoutes);

// ── Users ──
router.use("/users", requirePermissions("users.read"), userRoutes);

// ── Roles (super_admin only) ──
router.use("/roles", requireRoles("super_admin"), roleRoutes);

// ── Permissions (super_admin only) ──
router.use("/permissions", requireRoles("super_admin"), permissionRoutes);

// ── Uploads ──
router.use("/uploads", uploadRoutes);

export default router;
