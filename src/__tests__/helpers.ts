import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "@models/user.model";
import { Role } from "@models/role.model";
import { Permission } from "@models/permission.model";
import { RolePermission } from "@models/role-permission.model";
import { UserRole } from "@models/user-role.model";
import { Site } from "@models/site.model";
import { Service } from "@models/service.model";
import { Doctor } from "@models/doctor.model";
import { Event } from "@models/event.model";
import { Job } from "@models/job.model";
import { Newborn } from "@models/newborn.model";
import { PatientInfo } from "@models/patient-info.model";
import { ServiceContact } from "@models/service-contact.model";
import { ServiceLink } from "@models/service-link.model";

// ── Test Data IDs ──
export const testIds = {
  superAdminId: new mongoose.Types.ObjectId(),
  adminId: new mongoose.Types.ObjectId(),
  editorId: new mongoose.Types.ObjectId(),
  superAdminRoleId: new mongoose.Types.ObjectId(),
  adminRoleId: new mongoose.Types.ObjectId(),
  editorRoleId: new mongoose.Types.ObjectId(),
  siteId: new mongoose.Types.ObjectId(),
  site2Id: new mongoose.Types.ObjectId(),
  serviceId: new mongoose.Types.ObjectId(),
  doctorId: new mongoose.Types.ObjectId(),
  eventId: new mongoose.Types.ObjectId(),
  jobId: new mongoose.Types.ObjectId(),
  newbornId: new mongoose.Types.ObjectId(),
  patientInfoId: new mongoose.Types.ObjectId(),
  contactId: new mongoose.Types.ObjectId(),
  linkId: new mongoose.Types.ObjectId(),
};

const translatedField = (fr: string, en = "", de = "", it = "") => ({ fr, en, de, it });

export const TEST_PASSWORD = "TestPass123!";

/**
 * Seed minimal test data into the database.
 */
export const seedTestData = async (): Promise<void> => {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 4); // Low rounds for speed

  // ── Roles ──
  await Role.create([
    {
      _id: testIds.superAdminRoleId,
      name: "super_admin",
      display_name: translatedField("Super Admin"),
      description: translatedField("Full access"),
      is_system: true,
      is_active: true,
    },
    {
      _id: testIds.adminRoleId,
      name: "admin",
      display_name: translatedField("Admin"),
      description: translatedField("Admin access"),
      is_system: true,
      is_active: true,
    },
    {
      _id: testIds.editorRoleId,
      name: "content_editor",
      display_name: translatedField("Content Editor"),
      description: translatedField("Content editing"),
      is_system: false,
      is_active: true,
    },
  ]);

  // ── Permissions ──
  const resources = ["sites", "services", "doctors", "events", "jobs", "newborns", "patient_info", "users"];
  const actions = ["read", "create", "update", "delete"] as const;
  const permissions = [];
  const permissionIds: mongoose.Types.ObjectId[] = [];

  for (const resource of resources) {
    for (const action of actions) {
      const id = new mongoose.Types.ObjectId();
      permissionIds.push(id);
      permissions.push({
        _id: id,
        name: `${resource}.${action}`,
        display_name: `${action} ${resource}`,
        description: `Can ${action} ${resource}`,
        resource,
        action,
        is_active: true,
      });
    }
  }

  // Add dashboard.read
  const dashPermId = new mongoose.Types.ObjectId();
  permissionIds.push(dashPermId);
  permissions.push({
    _id: dashPermId,
    name: "dashboard.read",
    display_name: "Read dashboard",
    description: "Can read dashboard",
    resource: "dashboard",
    action: "read",
    is_active: true,
  });

  await Permission.create(permissions);

  // ── Role-Permission mappings (super_admin gets all) ──
  const rolePermissions = permissionIds.map((permId) => ({
    role_id: testIds.superAdminRoleId,
    permission_id: permId,
  }));

  // Admin gets most permissions (all read + some write)
  const adminPerms = permissionIds
    .filter((_p, i) => i < permissions.length)
    .map((permId) => ({
      role_id: testIds.adminRoleId,
      permission_id: permId,
    }));
  rolePermissions.push(...adminPerms);

  await RolePermission.create(rolePermissions);

  // ── Users ──
  await User.create([
    {
      _id: testIds.superAdminId,
      email: "test-superadmin@rhne.ch",
      password_hash: passwordHash,
      first_name: "Test",
      last_name: "SuperAdmin",
      phone: "+41 00 000 00 00",
      preferred_language: "fr",
      user_type: "admin",
      is_active: true,
      is_verified: true,
    },
    {
      _id: testIds.adminId,
      email: "test-admin@rhne.ch",
      password_hash: passwordHash,
      first_name: "Test",
      last_name: "Admin",
      phone: "+41 00 000 00 01",
      preferred_language: "fr",
      user_type: "admin",
      is_active: true,
      is_verified: true,
    },
    {
      _id: testIds.editorId,
      email: "test-editor@rhne.ch",
      password_hash: passwordHash,
      first_name: "Test",
      last_name: "Editor",
      phone: "+41 00 000 00 02",
      preferred_language: "fr",
      user_type: "staff",
      is_active: true,
      is_verified: true,
    },
  ]);

  // ── User-Role mappings ──
  await UserRole.create([
    { user_id: testIds.superAdminId, role_id: testIds.superAdminRoleId },
    { user_id: testIds.adminId, role_id: testIds.adminRoleId },
    { user_id: testIds.editorId, role_id: testIds.editorRoleId },
  ]);

  // ── Sites ──
  await Site.create([
    {
      _id: testIds.siteId,
      name: "Test Hospital Pourtalès",
      slug: "test-pourtales",
      type: translatedField("Soins aigus", "Acute care"),
      address: "Maladière 45",
      city: "Neuchâtel",
      postal_code: "2000",
      phone: "+41 32 713 30 00",
      maps_url: "https://maps.example.com",
      image_url: "https://example.com/site.jpg",
      description: translatedField("Test hospital site"),
      amenities: [translatedField("Parking"), translatedField("Cafétéria")],
      is_active: true,
    },
    {
      _id: testIds.site2Id,
      name: "Test Hospital La Chaux-de-Fonds",
      slug: "test-la-chaux-de-fonds",
      type: translatedField("Soins aigus"),
      address: "Chasseral 20",
      city: "La Chaux-de-Fonds",
      postal_code: "2300",
      phone: "+41 32 967 20 00",
      is_active: true,
    },
  ]);

  // ── Services ──
  await Service.create({
    _id: testIds.serviceId,
    name: translatedField("Cardiologie", "Cardiology"),
    slug: "test-cardiologie",
    category: "medical",
    image_url: "https://example.com/cardio.jpg",
    description: translatedField("Service de cardiologie"),
    prestations: [translatedField("Consultation"), translatedField("Échographie")],
    is_active: true,
  });

  // ── Service Contact ──
  await ServiceContact.create({
    _id: testIds.contactId,
    service_id: testIds.serviceId,
    site_id: testIds.siteId,
    site_name: "Test Hospital Pourtalès",
    email: "cardio@test.ch",
    phone: "+41 32 000 00 00",
    hours: translatedField("Lun-Ven 8h-17h"),
  });

  // ── Service Link ──
  await ServiceLink.create({
    _id: testIds.linkId,
    service_id: testIds.serviceId,
    title: translatedField("Information cardiologie"),
    url: "https://example.com/cardio-info",
  });

  // ── Doctors ──
  await Doctor.create({
    _id: testIds.doctorId,
    name: "Test Docteur",
    title: "Dr",
    service_id: testIds.serviceId,
    service_name: "Cardiologie",
    image_url: "https://example.com/doctor.jpg",
    is_active: true,
  });

  // ── Events ──
  await Event.create({
    _id: testIds.eventId,
    title: translatedField("Journée portes ouvertes", "Open Day"),
    slug: "test-journee-portes-ouvertes",
    url: "https://example.com/event",
    date: "2026-06-15",
    time: translatedField("10h-16h"),
    location: translatedField("Site de Pourtalès"),
    category: translatedField("Public"),
    description: translatedField("Test event description"),
    detail_url: "https://example.com/event/detail",
    is_active: true,
  });

  // ── Jobs ──
  await Job.create({
    _id: testIds.jobId,
    title: translatedField("Infirmier/ère diplômé/e", "Registered Nurse"),
    job_id: "TEST-JOB-001",
    url: "https://example.com/job",
    category: "soins",
    percentage: "80-100%",
    description: translatedField("Poste d'infirmier/ère"),
    requirements: [translatedField("Diplôme reconnu"), translatedField("Expérience 2 ans")],
    site: "Pourtalès",
    department: "Cardiologie",
    published_date: "2026-01-15",
    is_active: true,
  });

  // ── Newborns ──
  await Newborn.create({
    _id: testIds.newbornId,
    name: "Test Bébé",
    date: "1er janvier 2026",
    image_url: "https://example.com/baby.jpg",
  });

  // ── Patient Info ──
  await PatientInfo.create({
    _id: testIds.patientInfoId,
    title: translatedField("Admission", "Admission"),
    slug: "test-admission",
    url: "https://example.com/admission",
    section: "séjour",
    sections: [
      {
        id: "sec-1",
        title: translatedField("Que faut-il apporter?", "What to bring?"),
        content: translatedField("Apportez vos documents", "Bring your documents"),
        list_items: [translatedField("Carte d'identité"), translatedField("Carte d'assurance")],
      },
    ],
    content: translatedField("Page d'admission"),
    image_url: "https://example.com/admission.jpg",
  });
};

/**
 * Clean all test data from database.
 */
export const cleanTestData = async (): Promise<void> => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};
