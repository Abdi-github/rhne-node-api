import request from "supertest";
import mongoose from "mongoose";
import app from "@/app";
import { seedTestData, cleanTestData, testIds, TEST_PASSWORD } from "./helpers";

const API = "/api/v1/admin";
const AUTH_API = "/api/v1/auth";

let superAdminToken: string;
let adminToken: string;
let editorToken: string;

/**
 * Helper to login and get an access token.
 */
const loginAs = async (email: string): Promise<string> => {
  const res = await request(app).post(`${AUTH_API}/login`).send({
    email,
    password: TEST_PASSWORD,
  });
  return res.body.data.tokens.access_token;
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  await cleanTestData();
  await seedTestData();

  // Get tokens for each role
  superAdminToken = await loginAs("test-superadmin@rhne.ch");
  adminToken = await loginAs("test-admin@rhne.ch");
  editorToken = await loginAs("test-editor@rhne.ch");
});

afterAll(async () => {
  await cleanTestData();
  await mongoose.disconnect();
});

// ══════════════════════════════════════════════════════════
// AUTH PROTECTION
// ══════════════════════════════════════════════════════════

describe("Admin auth protection", () => {
  it("should return 401 without auth token", async () => {
    const res = await request(app).get(`${API}/dashboard/stats`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 401 with invalid token", async () => {
    const res = await request(app)
      .get(`${API}/dashboard/stats`)
      .set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 401 with malformed Authorization header", async () => {
    const res = await request(app)
      .get(`${API}/dashboard/stats`)
      .set("Authorization", "NotBearer some-token");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════
// RBAC PROTECTION
// ══════════════════════════════════════════════════════════

describe("RBAC permission checks", () => {
  it("should allow super_admin to access any resource", async () => {
    const res = await request(app)
      .get(`${API}/sites`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should allow admin to access resources with proper permissions", async () => {
    const res = await request(app)
      .get(`${API}/sites`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should deny content_editor access to users management", async () => {
    const res = await request(app)
      .get(`${API}/users`)
      .set("Authorization", `Bearer ${editorToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════

describe("GET /admin/dashboard/stats", () => {
  it("should return dashboard statistics", async () => {
    const res = await request(app)
      .get(`${API}/dashboard/stats`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    // Stats are nested under total and active
    expect(typeof res.body.data.total.sites).toBe("number");
    expect(typeof res.body.data.total.services).toBe("number");
    expect(typeof res.body.data.total.doctors).toBe("number");
    expect(typeof res.body.data.active.sites).toBe("number");
  });
});

// ══════════════════════════════════════════════════════════
// SITES CRUD
// ══════════════════════════════════════════════════════════

describe("Admin Sites CRUD", () => {
  let createdSiteId: string;

  it("GET /admin/sites — should list all sites (incl. inactive)", async () => {
    const res = await request(app)
      .get(`${API}/sites`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it("POST /admin/sites — should create a new site", async () => {
    const res = await request(app)
      .post(`${API}/sites`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        name: "New Test Site",
        type: { fr: "Réhabilitation", en: "Rehabilitation", de: "", it: "" },
        address: "Rue Test 1",
        city: "Bienne",
        postal_code: "2502",
        phone: "+41 32 111 22 33",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("New Test Site");
    expect(res.body.data.slug).toBeDefined();
    createdSiteId = res.body.data._id;
  });

  it("GET /admin/sites/:id — should return site by ID", async () => {
    const res = await request(app)
      .get(`${API}/sites/${createdSiteId}`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(createdSiteId);
    expect(res.body.data.name).toBe("New Test Site");
  });

  it("PUT /admin/sites/:id — should update a site", async () => {
    const res = await request(app)
      .put(`${API}/sites/${createdSiteId}`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        name: "Updated Test Site",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Updated Test Site");
  });

  it("DELETE /admin/sites/:id — should soft-delete a site", async () => {
    const res = await request(app)
      .delete(`${API}/sites/${createdSiteId}`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify the site is soft-deleted (is_active = false)
    const getRes = await request(app)
      .get(`${API}/sites/${createdSiteId}`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.is_active).toBe(false);
  });

  it("GET /admin/sites/:id — should return 404 for nonexistent site", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`${API}/sites/${fakeId}`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════════════════

describe("Admin Profile", () => {
  it("GET /admin/profile — should return authenticated user profile", async () => {
    const res = await request(app)
      .get(`${API}/profile`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("test-superadmin@rhne.ch");
    expect(res.body.data.first_name).toBe("Test");
    expect(res.body.data.last_name).toBe("SuperAdmin");
    expect(res.body.data.password_hash).toBeUndefined();
  });

  it("PUT /admin/profile — should update profile fields", async () => {
    const res = await request(app)
      .put(`${API}/profile`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        first_name: "Updated",
        last_name: "SuperAdmin",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.first_name).toBe("Updated");
  });

  it("PUT /admin/profile/password — should change password", async () => {
    const res = await request(app)
      .put(`${API}/profile/password`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        current_password: TEST_PASSWORD,
        new_password: "NewPassword456!",
        confirm_password: "NewPassword456!",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify new password works by logging in
    const loginRes = await request(app).post(`${AUTH_API}/login`).send({
      email: "test-admin@rhne.ch",
      password: "NewPassword456!",
    });
    expect(loginRes.status).toBe(200);

    // Restore original password for remaining tests
    const newToken = loginRes.body.data.tokens.access_token;
    await request(app)
      .put(`${API}/profile/password`)
      .set("Authorization", `Bearer ${newToken}`)
      .send({
        current_password: "NewPassword456!",
        new_password: TEST_PASSWORD,
        confirm_password: TEST_PASSWORD,
      });
  });

  it("PUT /admin/profile/password — should reject wrong current password", async () => {
    const res = await request(app)
      .put(`${API}/profile/password`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        current_password: "WrongPassword!",
        new_password: "NewPassword456!",
        confirm_password: "NewPassword456!",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════
// ADMIN EVENTS CRUD (representative of standalone resource)
// ══════════════════════════════════════════════════════════

describe("Admin Events CRUD", () => {
  let createdEventId: string;

  it("GET /admin/events — should list all events", async () => {
    const res = await request(app)
      .get(`${API}/events`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it("POST /admin/events — should create a new event", async () => {
    const res = await request(app)
      .post(`${API}/events`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        title: { fr: "Conférence Santé", en: "Health Conference", de: "", it: "" },
        url: "https://example.com/conference",
        date: "2026-09-15",
        time: { fr: "14h-18h", en: "2pm-6pm", de: "", it: "" },
        location: { fr: "Salle 100", en: "Room 100", de: "", it: "" },
        category: { fr: "Conférence", en: "Conference", de: "", it: "" },
        description: { fr: "Description test", en: "Test description", de: "", it: "" },
        detail_url: "https://example.com/conference/detail",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBeDefined();
    createdEventId = res.body.data._id;
  });

  it("PUT /admin/events/:id — should update an event", async () => {
    const res = await request(app)
      .put(`${API}/events/${createdEventId}`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        date: "2026-10-20",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.date).toBe("2026-10-20");
  });

  it("DELETE /admin/events/:id — should soft-delete an event", async () => {
    const res = await request(app)
      .delete(`${API}/events/${createdEventId}`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════
// ADMIN DOCTORS CRUD
// ══════════════════════════════════════════════════════════

describe("Admin Doctors CRUD", () => {
  let createdDoctorId: string;

  it("POST /admin/doctors — should create a doctor", async () => {
    const res = await request(app)
      .post(`${API}/doctors`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        name: "New Test Doctor",
        title: "Prof",
        service_id: testIds.serviceId.toString(),
        service_name: "Cardiologie",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("New Test Doctor");
    expect(res.body.data.title).toBe("Prof");
    createdDoctorId = res.body.data._id;
  });

  it("GET /admin/doctors/:id — should get a doctor", async () => {
    const res = await request(app)
      .get(`${API}/doctors/${createdDoctorId}`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("New Test Doctor");
  });

  it("PUT /admin/doctors/:id — should update a doctor", async () => {
    const res = await request(app)
      .put(`${API}/doctors/${createdDoctorId}`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({ title: "Dr" });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Dr");
  });

  it("DELETE /admin/doctors/:id — should delete a doctor", async () => {
    const res = await request(app)
      .delete(`${API}/doctors/${createdDoctorId}`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════
// ADMIN USERS CRUD
// ══════════════════════════════════════════════════════════

describe("Admin Users", () => {
  let createdUserId: string;

  it("GET /admin/users — should list users", async () => {
    const res = await request(app)
      .get(`${API}/users`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    // Password hash should never be exposed
    res.body.data.forEach((user: Record<string, unknown>) => {
      expect(user.password_hash).toBeUndefined();
    });
  });

  it("POST /admin/users — should create a new user", async () => {
    const res = await request(app)
      .post(`${API}/users`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        email: "newuser@rhne-test.ch",
        password: "NewUser123!",
        first_name: "New",
        last_name: "User",
        phone: "+41 32 999 00 00",
        preferred_language: "fr",
        user_type: "staff",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("newuser@rhne-test.ch");
    expect(res.body.data.password_hash).toBeUndefined();
    createdUserId = res.body.data._id;
  });

  it("GET /admin/users/:id — should return user by ID", async () => {
    const res = await request(app)
      .get(`${API}/users/${createdUserId}`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("newuser@rhne-test.ch");
  });

  it("PUT /admin/users/:id — should update a user", async () => {
    const res = await request(app)
      .put(`${API}/users/${createdUserId}`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        first_name: "Updated",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.first_name).toBe("Updated");
  });

  it("DELETE /admin/users/:id — should delete a user", async () => {
    const res = await request(app)
      .delete(`${API}/users/${createdUserId}`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
