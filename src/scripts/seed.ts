import path from "node:path";
import fs from "node:fs";
import mongoose from "mongoose";
import { connectDB } from "@config/db";
import { logger } from "@shared/utils/logger";

// ── Import all models ──
import { Site } from "@models/site.model";
import { Service } from "@models/service.model";
import { ServiceContact } from "@models/service-contact.model";
import { ServiceLink } from "@models/service-link.model";
import { ServiceBrochure } from "@models/service-brochure.model";
import { Doctor } from "@models/doctor.model";
import { Event } from "@models/event.model";
import { Job } from "@models/job.model";
import { Newborn } from "@models/newborn.model";
import { PatientInfo } from "@models/patient-info.model";
import { EmergencyHotline } from "@models/emergency-hotline.model";
import { Appointment } from "@models/appointment.model";
import { User } from "@models/user.model";
import { Role } from "@models/role.model";
import { Permission } from "@models/permission.model";
import { RolePermission } from "@models/role-permission.model";
import { UserRole } from "@models/user-role.model";

// ── Helpers ──
const DATA_DIR = path.resolve(__dirname, "../../data");

const readJSON = <T>(filename: string): T[] => {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T[];
};

const isFresh = process.argv.includes("--fresh");

// ── Seed collection helper ──
interface SeedConfig {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: mongoose.Model<any>;
  file: string;
}

const seedCollections: SeedConfig[] = [
  // 1. RBAC (no dependencies)
  { name: "Roles", model: Role, file: "roles.json" },
  { name: "Permissions", model: Permission, file: "permissions.json" },
  { name: "RolePermissions", model: RolePermission, file: "role_permissions.json" },

  // 2. Users (depends on roles)
  { name: "Users", model: User, file: "users.json" },
  { name: "UserRoles", model: UserRole, file: "user_roles.json" },

  // 3. Sites (no dependencies)
  { name: "Sites", model: Site, file: "sites.json" },

  // 4. Services (no dependencies)
  { name: "Services", model: Service, file: "services.json" },

  // 5. Service sub-resources (depend on services + sites)
  { name: "ServiceContacts", model: ServiceContact, file: "service_contacts.json" },
  { name: "ServiceLinks", model: ServiceLink, file: "service_links.json" },
  { name: "ServiceBrochures", model: ServiceBrochure, file: "service_brochures.json" },

  // 6. Doctors (depend on services)
  { name: "Doctors", model: Doctor, file: "doctors.json" },

  // 7. Standalone
  { name: "Events", model: Event, file: "events.json" },
  { name: "Jobs", model: Job, file: "jobs.json" },
  { name: "Newborns", model: Newborn, file: "newborns.json" },
  { name: "PatientInfo", model: PatientInfo, file: "patient_info.json" },
  { name: "EmergencyHotlines", model: EmergencyHotline, file: "emergency_hotlines.json" },
  { name: "Appointments", model: Appointment, file: "appointments.json" },
];

// ── Main seeder ──
const seed = async (): Promise<void> => {
  try {
    await connectDB();

    logger.info("────────────────────────────────────────");
    logger.info(`🌱 Starting database seed${isFresh ? " (FRESH)" : ""}...`);
    logger.info("────────────────────────────────────────");

    // Fresh mode: drop all collections
    if (isFresh) {
      logger.info("🗑️  Dropping all collections...");
      const collections = await mongoose.connection.db!.listCollections().toArray();
      for (const collection of collections) {
        await mongoose.connection.db!.dropCollection(collection.name);
        logger.info(`   Dropped: ${collection.name}`);
      }
      logger.info("");
    }

    // Seed each collection
    let totalInserted = 0;

    for (const { name, model, file } of seedCollections) {
      try {
        const data = readJSON(file);

        if (data.length === 0) {
          logger.info(`   ⏭️  ${name}: skipped (empty data file)`);
          continue;
        }

        // Check if already seeded (skip if not fresh)
        if (!isFresh) {
          const existingCount = await model.countDocuments();
          if (existingCount > 0) {
            logger.info(`   ⏭️  ${name}: skipped (${existingCount} records exist)`);
            continue;
          }
        }

        await model.insertMany(data, { ordered: false });
        totalInserted += data.length;
        logger.info(`   ✅ ${name}: ${data.length} records inserted`);
      } catch (error) {
        // Handle duplicate key errors gracefully
        if (error instanceof Error && "code" in error && (error as { code: number }).code === 11000) {
          logger.warn(`   ⚠️  ${name}: some duplicates skipped`);
        } else {
          logger.error(`   ❌ ${name}: ${error instanceof Error ? error.message : "Unknown error"}`);
          throw error;
        }
      }
    }

    logger.info("");
    logger.info("────────────────────────────────────────");
    logger.info(`✅ Seed complete! ${totalInserted} total records inserted.`);
    logger.info("────────────────────────────────────────");

    process.exit(0);
  } catch (error) {
    logger.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seed();
