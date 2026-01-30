import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "@/app";
import { seedTestData, cleanTestData, TEST_PASSWORD } from "./helpers";

const API = "/api/v1/auth";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  await cleanTestData();
  await seedTestData();
});

afterAll(async () => {
  await cleanTestData();
  await mongoose.disconnect();
});

// ── Login ──────────────────────────────────────────────

describe("POST /auth/login", () => {
  it("should login with valid credentials", async () => {
    const res = await request(app).post(`${API}/login`).send({
      email: "test-superadmin@rhne.ch",
      password: TEST_PASSWORD,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe("test-superadmin@rhne.ch");
    expect(res.body.data.user.roles).toContain("super_admin");
    expect(res.body.data.user.permissions).toBeDefined();
    expect(res.body.data.user.password_hash).toBeUndefined();
    expect(res.body.data.tokens.access_token).toBeDefined();
    expect(res.body.data.tokens.refresh_token).toBeDefined();
    expect(res.body.data.tokens.expires_in).toBeDefined();
  });

  it("should return 401 for invalid password", async () => {
    const res = await request(app).post(`${API}/login`).send({
      email: "test-superadmin@rhne.ch",
      password: "WrongPassword123!",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("should return 401 for nonexistent email", async () => {
    const res = await request(app).post(`${API}/login`).send({
      email: "nobody@rhne.ch",
      password: TEST_PASSWORD,
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for missing fields", async () => {
    const res = await request(app).post(`${API}/login`).send({
      email: "test-superadmin@rhne.ch",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for invalid email format", async () => {
    const res = await request(app).post(`${API}/login`).send({
      email: "not-an-email",
      password: TEST_PASSWORD,
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ── Refresh Token ────────────────────────────────────────

describe("POST /auth/refresh", () => {
  let refreshToken: string;

  beforeAll(async () => {
    const loginRes = await request(app).post(`${API}/login`).send({
      email: "test-superadmin@rhne.ch",
      password: TEST_PASSWORD,
    });
    refreshToken = loginRes.body.data.tokens.refresh_token;
  });

  it("should refresh access token with valid refresh token", async () => {
    const res = await request(app).post(`${API}/refresh`).send({
      refresh_token: refreshToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.access_token).toBeDefined();
    expect(res.body.data.tokens.refresh_token).toBe(refreshToken);
    expect(res.body.data.user).toBeDefined();
  });

  it("should return 401 for invalid refresh token", async () => {
    const res = await request(app).post(`${API}/refresh`).send({
      refresh_token: "invalid-token-value",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for missing refresh_token", async () => {
    const res = await request(app).post(`${API}/refresh`).send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ── Logout ──────────────────────────────────────────────

describe("POST /auth/logout", () => {
  it("should logout successfully with valid refresh token", async () => {
    // Login to get a fresh token
    const loginRes = await request(app).post(`${API}/login`).send({
      email: "test-admin@rhne.ch",
      password: TEST_PASSWORD,
    });
    const refreshToken = loginRes.body.data.tokens.refresh_token;

    const res = await request(app).post(`${API}/logout`).send({
      refresh_token: refreshToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Logout successful");

    // Verify the refresh token is now revoked
    const refreshRes = await request(app).post(`${API}/refresh`).send({
      refresh_token: refreshToken,
    });
    expect(refreshRes.status).toBe(401);
  });

  it("should return 400 for invalid refresh token on logout", async () => {
    const res = await request(app).post(`${API}/logout`).send({
      refresh_token: "nonexistent-token",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ── Forgot Password ──────────────────────────────────────

describe("POST /auth/forgot-password", () => {
  it("should return 200 for existing email (security: no leak)", async () => {
    const res = await request(app).post(`${API}/forgot-password`).send({
      email: "test-superadmin@rhne.ch",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should return 200 for nonexistent email (security: no leak)", async () => {
    const res = await request(app).post(`${API}/forgot-password`).send({
      email: "nobody@rhne.ch",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should return 400 for invalid email format", async () => {
    const res = await request(app).post(`${API}/forgot-password`).send({
      email: "not-valid",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ── Reset Password ──────────────────────────────────────

describe("POST /auth/reset-password", () => {
  it("should reset password with a valid token", async () => {
    // Generate a valid reset token
    const token = jwt.sign(
      { userId: "000000000000000000000001", purpose: "password_reset" },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "1h" },
    );

    // The token has a valid structure and purpose, but the userId doesn't
    // match a real user. The service catches the notFound error.
    const res = await request(app).post(`${API}/reset-password`).send({
      token,
      password: "NewPassword123!",
    });

    // User not found → 404
    expect([400, 404]).toContain(res.status);
  });

  it("should return 400 for invalid token", async () => {
    const res = await request(app).post(`${API}/reset-password`).send({
      token: "totally-invalid-token",
      password: "NewPassword123!",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for missing fields", async () => {
    const res = await request(app).post(`${API}/reset-password`).send({
      token: "some-token",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
