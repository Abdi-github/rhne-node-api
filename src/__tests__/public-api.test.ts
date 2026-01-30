import request from "supertest";
import mongoose from "mongoose";
import app from "@/app";
import { seedTestData, cleanTestData, testIds } from "./helpers";

const API = "/api/v1";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  await cleanTestData();
  await seedTestData();
});

afterAll(async () => {
  await cleanTestData();
  await mongoose.disconnect();
});

// ══════════════════════════════════════════════════════════
// SITES
// ══════════════════════════════════════════════════════════

describe("GET /sites", () => {
  it("should return a paginated list of active sites", async () => {
    const res = await request(app).get(`${API}/sites`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(2);
  });

  it("should support pagination parameters", async () => {
    const res = await request(app).get(`${API}/sites?page=1&limit=1`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.pagination.limit).toBe(1);
    expect(res.body.pagination.totalPages).toBe(2);
  });
});

describe("GET /sites/:slug", () => {
  it("should return a site by slug", async () => {
    const res = await request(app).get(`${API}/sites/test-pourtales`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Test Hospital Pourtalès");
    expect(res.body.data.slug).toBe("test-pourtales");
  });

  it("should return 404 for nonexistent slug", async () => {
    const res = await request(app).get(`${API}/sites/no-such-site`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════
// SERVICES
// ══════════════════════════════════════════════════════════

describe("GET /services", () => {
  it("should return a list of active services", async () => {
    const res = await request(app).get(`${API}/services`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.pagination).toBeDefined();
  });

  it("should filter by category", async () => {
    const res = await request(app).get(`${API}/services?category=medical`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    res.body.data.forEach((s: { category: string }) => {
      expect(s.category).toBe("medical");
    });
  });
});

describe("GET /services/:slug", () => {
  it("should return a service by slug with contacts and links", async () => {
    const res = await request(app).get(`${API}/services/test-cardiologie`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBeDefined();
    expect(res.body.data.slug).toBe("test-cardiologie");
    // Service detail should include related data
    expect(res.body.data.contacts).toBeDefined();
    expect(res.body.data.links).toBeDefined();
  });

  it("should return 404 for nonexistent slug", async () => {
    const res = await request(app).get(`${API}/services/no-such-service`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════
// DOCTORS
// ══════════════════════════════════════════════════════════

describe("GET /doctors", () => {
  it("should return a list of active doctors", async () => {
    const res = await request(app).get(`${API}/doctors`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("should filter by service", async () => {
    const res = await request(app).get(`${API}/doctors?service=${testIds.serviceId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe("GET /doctors/:id", () => {
  it("should return a doctor by ID", async () => {
    const res = await request(app).get(`${API}/doctors/${testIds.doctorId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Test Docteur");
  });

  it("should return 404 for nonexistent doctor", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`${API}/doctors/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════
// EVENTS
// ══════════════════════════════════════════════════════════

describe("GET /events", () => {
  it("should return a list of active events", async () => {
    const res = await request(app).get(`${API}/events`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe("GET /events/:slug", () => {
  it("should return an event by slug", async () => {
    const res = await request(app).get(`${API}/events/test-journee-portes-ouvertes`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe("test-journee-portes-ouvertes");
  });

  it("should return 404 for nonexistent event", async () => {
    const res = await request(app).get(`${API}/events/no-such-event`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════
// JOBS
// ══════════════════════════════════════════════════════════

describe("GET /jobs", () => {
  it("should return a list of active jobs", async () => {
    const res = await request(app).get(`${API}/jobs`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("should filter by category", async () => {
    const res = await request(app).get(`${API}/jobs?category=soins`);

    expect(res.status).toBe(200);
    res.body.data.forEach((j: { category: string }) => {
      expect(j.category).toBe("soins");
    });
  });
});

describe("GET /jobs/:id", () => {
  it("should return a job by ID", async () => {
    const res = await request(app).get(`${API}/jobs/${testIds.jobId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.job_id).toBe("TEST-JOB-001");
  });

  it("should return 404 for nonexistent job", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`${API}/jobs/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════
// NEWBORNS
// ══════════════════════════════════════════════════════════

describe("GET /newborns", () => {
  it("should return a paginated list of newborns", async () => {
    const res = await request(app).get(`${API}/newborns`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.pagination).toBeDefined();
  });
});

// ══════════════════════════════════════════════════════════
// PATIENT INFO
// ══════════════════════════════════════════════════════════

describe("GET /patient-info", () => {
  it("should return a list of patient info pages", async () => {
    const res = await request(app).get(`${API}/patient-info`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("should filter by section", async () => {
    const res = await request(app).get(`${API}/patient-info?section=séjour`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe("GET /patient-info/:slug", () => {
  it("should return patient info page by slug with sections", async () => {
    const res = await request(app).get(`${API}/patient-info/test-admission`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe("test-admission");
    expect(res.body.data.sections).toBeDefined();
    expect(res.body.data.sections.length).toBeGreaterThanOrEqual(1);
  });

  it("should return 404 for nonexistent patient info", async () => {
    const res = await request(app).get(`${API}/patient-info/no-such-page`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════
// SEARCH
// ══════════════════════════════════════════════════════════

describe("GET /search", () => {
  it("should return search results for matching query", async () => {
    const res = await request(app).get(`${API}/search?q=Test`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it("should return 400 for missing query", async () => {
    const res = await request(app).get(`${API}/search`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════
// LANGUAGE SUPPORT
// ══════════════════════════════════════════════════════════

describe("Language header support", () => {
  it("should return French content by default", async () => {
    const res = await request(app).get(`${API}/sites/test-pourtales`);

    expect(res.status).toBe(200);
    // Name is a plain string (not TranslatedField), so always the same
    expect(res.body.data.name).toBe("Test Hospital Pourtalès");
  });

  it("should accept Accept-Language header", async () => {
    const res = await request(app)
      .get(`${API}/services/test-cardiologie`)
      .set("Accept-Language", "en");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should accept lang query param", async () => {
    const res = await request(app).get(`${API}/services/test-cardiologie?lang=en`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════
// HEALTH CHECK
// ══════════════════════════════════════════════════════════

describe("GET /health", () => {
  it("should return health status", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeDefined();
  });
});

describe("GET /api/v1", () => {
  it("should return API info", async () => {
    const res = await request(app).get(`${API}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("RHNe API is running");
    expect(res.body.version).toBe("v1");
  });
});
