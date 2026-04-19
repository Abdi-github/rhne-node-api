import swaggerJsdoc from "swagger-jsdoc";
import { env } from "@config/env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "RHNe API",
      version: "1.0.0",
      description:
        "REST API for the RHNe hospital network clone — manages sites, services, doctors, events, jobs, newborns, patient information, emergency hotlines, appointments, and appointment bookings.\n\n" +
        "## Authentication\n\n" +
        "Admin endpoints require a **Bearer token** in the `Authorization` header.\n" +
        "Obtain a token via `POST /api/v1/auth/login`, then use the **Authorize** button above.\n\n" +
        "## Demo Credentials\n\n" +
        "| Role | Email | Password |\n" +
        "|------|-------|----------|\n" +
        "| Super Admin | superadmin@rhne-clone.ch | SuperAdmin123! |\n" +
        "| Admin | admin@rhne-clone.ch | Admin123! |\n" +
        "| Content Editor | editor@rhne-clone.ch | Editor123! |\n" +
        "| HR Manager | hr@rhne-clone.ch | HrManager123! |\n" +
        "| Site Manager | site.pourtales@rhne-clone.ch | Manager123! |\n\n" +
        "## Roles & Permissions\n\n" +
        "- **super_admin** — Full access to everything including roles and permissions management\n" +
        "- **admin** — Full access to all content and user management\n" +
        "- **content_editor** — Manage sites, services, doctors, events, patient info, emergency hotlines\n" +
        "- **hr_manager** — Manage jobs and newborns\n" +
        "- **site_manager** — Manage appointments and appointment bookings for assigned sites\n\n" +
        "## Multilingual Support\n\n" +
        "Use the `Accept-Language` header with `fr`, `en`, `de`, or `it` (default: `fr`).",
      contact: {
        name: "RHNe API",
      },
    },
    servers: [
      {
        url:
          env.NODE_ENV === "production"
            ? "https://rhne-api.swiftapp.ch"
            : `http://localhost:${env.PORT}`,
        description:
          env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter your access token from POST /api/v1/auth/login",
        },
      },
      parameters: {
        AcceptLanguage: {
          in: "header",
          name: "Accept-Language",
          schema: { type: "string", enum: ["fr", "en", "de", "it"], default: "fr" },
          description: "Response language",
        },
        IdParam: {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          description: "MongoDB ObjectId",
        },
        SlugParam: {
          in: "path",
          name: "slug",
          required: true,
          schema: { type: "string" },
          description: "URL-friendly identifier",
        },
      },
      schemas: {
        TranslatedField: {
          type: "object",
          required: ["fr"],
          properties: {
            fr: { type: "string", description: "French (required)" },
            en: { type: "string", description: "English" },
            de: { type: "string", description: "German" },
            it: { type: "string", description: "Italian" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "array", items: { type: "object" } },
            pagination: {
              type: "object",
              properties: {
                total: { type: "integer" },
                page: { type: "integer" },
                limit: { type: "integer" },
                pages: { type: "integer" },
              },
            },
          },
        },
        // ── Auth ──
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "admin@rhne-clone.ch" },
            password: { type: "string", example: "Admin123!" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                access_token: { type: "string" },
                refresh_token: { type: "string" },
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    email: { type: "string" },
                    first_name: { type: "string" },
                    last_name: { type: "string" },
                    roles: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
        },
        RefreshTokenRequest: {
          type: "object",
          required: ["refresh_token"],
          properties: {
            refresh_token: { type: "string" },
          },
        },
        ForgotPasswordRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
          },
        },
        ResetPasswordRequest: {
          type: "object",
          required: ["token", "password", "password_confirm"],
          properties: {
            token: { type: "string" },
            password: { type: "string", minLength: 8 },
            password_confirm: { type: "string" },
          },
        },
        // ── Site ──
        Site: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            slug: { type: "string" },
            type: { $ref: "#/components/schemas/TranslatedField" },
            address: { type: "string" },
            city: { type: "string" },
            postal_code: { type: "string" },
            phone: { type: "string" },
            maps_url: { type: "string" },
            image_url: { type: "string" },
            description: { $ref: "#/components/schemas/TranslatedField" },
            amenities: { type: "array", items: { $ref: "#/components/schemas/TranslatedField" } },
            is_active: { type: "boolean" },
          },
        },
        CreateSite: {
          type: "object",
          required: ["name", "type", "address", "city", "postal_code"],
          properties: {
            name: { type: "string" },
            type: { $ref: "#/components/schemas/TranslatedField" },
            address: { type: "string" },
            city: { type: "string" },
            postal_code: { type: "string", pattern: "^\\d{4}$" },
            phone: { type: "string" },
            maps_url: { type: "string" },
            image_url: { type: "string" },
            description: { $ref: "#/components/schemas/TranslatedField" },
            amenities: { type: "array", items: { $ref: "#/components/schemas/TranslatedField" } },
            is_active: { type: "boolean", default: true },
          },
        },
        // ── Service ──
        Service: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { $ref: "#/components/schemas/TranslatedField" },
            slug: { type: "string" },
            category: { $ref: "#/components/schemas/TranslatedField" },
            description: { $ref: "#/components/schemas/TranslatedField" },
            image_url: { type: "string" },
            site_id: { type: "string" },
            is_active: { type: "boolean" },
          },
        },
        // ── Doctor ──
        Doctor: {
          type: "object",
          properties: {
            _id: { type: "string" },
            first_name: { type: "string" },
            last_name: { type: "string" },
            title: { type: "string" },
            specialty: { $ref: "#/components/schemas/TranslatedField" },
            image_url: { type: "string" },
            service_id: { type: "string" },
            site_id: { type: "string" },
            is_active: { type: "boolean" },
          },
        },
        // ── Event ──
        Event: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { $ref: "#/components/schemas/TranslatedField" },
            slug: { type: "string" },
            description: { $ref: "#/components/schemas/TranslatedField" },
            date: { type: "string", format: "date-time" },
            location: { type: "string" },
            image_url: { type: "string" },
            is_active: { type: "boolean" },
          },
        },
        // ── Job ──
        Job: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { $ref: "#/components/schemas/TranslatedField" },
            description: { $ref: "#/components/schemas/TranslatedField" },
            category: { $ref: "#/components/schemas/TranslatedField" },
            type: { type: "string", enum: ["full-time", "part-time", "temporary", "internship"] },
            site_id: { type: "string" },
            is_active: { type: "boolean" },
          },
        },
        // ── Newborn ──
        Newborn: {
          type: "object",
          properties: {
            _id: { type: "string" },
            first_name: { type: "string" },
            birth_date: { type: "string", format: "date" },
            weight: { type: "number" },
            height: { type: "number" },
            image_url: { type: "string" },
          },
        },
        // ── Patient Info ──
        PatientInfo: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { $ref: "#/components/schemas/TranslatedField" },
            slug: { type: "string" },
            section: { type: "string" },
            content: { $ref: "#/components/schemas/TranslatedField" },
            is_active: { type: "boolean" },
          },
        },
        // ── Emergency Hotline ──
        EmergencyHotline: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { $ref: "#/components/schemas/TranslatedField" },
            slug: { type: "string" },
            phone: { type: "string" },
            description: { $ref: "#/components/schemas/TranslatedField" },
            is_active: { type: "boolean" },
          },
        },
        // ── Appointment ──
        Appointment: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { $ref: "#/components/schemas/TranslatedField" },
            slug: { type: "string" },
            type: { type: "string", enum: ["adult", "child", "doctor"] },
            description: { $ref: "#/components/schemas/TranslatedField" },
            duration_minutes: { type: "integer" },
            is_active: { type: "boolean" },
          },
        },
        // ── Appointment Booking ──
        AppointmentBooking: {
          type: "object",
          properties: {
            _id: { type: "string" },
            booking_reference: { type: "string" },
            appointment_id: { type: "string" },
            appointment_type: { type: "string", enum: ["adult", "child", "doctor"] },
            patient_info: {
              type: "object",
              properties: {
                first_name: { type: "string" },
                last_name: { type: "string" },
                email: { type: "string", format: "email" },
                phone: { type: "string" },
                date_of_birth: { type: "string", format: "date" },
              },
            },
            site_id: { type: "string", nullable: true },
            site_name: { type: "string" },
            preferred_date: { type: "string", format: "date" },
            preferred_time_slot: { type: "string" },
            reason: { type: "string" },
            symptoms: { type: "array", items: { type: "string" } },
            status: { type: "string", enum: ["pending", "confirmed", "cancelled", "completed", "no_show"] },
            notes: { type: "string" },
            confirmed_by: { type: "string" },
            confirmed_at: { type: "string", format: "date-time" },
            cancelled_at: { type: "string", format: "date-time" },
            cancellation_reason: { type: "string" },
          },
        },
        CreateBooking: {
          type: "object",
          required: ["appointment_id", "preferred_date", "preferred_time_slot", "reason", "patient_info"],
          properties: {
            appointment_id: { type: "string" },
            site_id: { type: "string" },
            preferred_date: { type: "string", format: "date" },
            preferred_time_slot: { type: "string" },
            reason: { type: "string" },
            symptoms: { type: "array", items: { type: "string" } },
            patient_info: {
              type: "object",
              required: ["first_name", "last_name", "email", "phone", "date_of_birth"],
              properties: {
                first_name: { type: "string" },
                last_name: { type: "string" },
                email: { type: "string", format: "email" },
                phone: { type: "string" },
                date_of_birth: { type: "string", format: "date" },
              },
            },
          },
        },
        UpdateBookingStatus: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "string", enum: ["confirmed", "cancelled", "completed", "no_show"] },
            notes: { type: "string" },
          },
        },
        // ── User ──
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            first_name: { type: "string" },
            last_name: { type: "string" },
            email: { type: "string", format: "email" },
            roles: { type: "array", items: { type: "string" } },
            is_active: { type: "boolean" },
          },
        },
        // ── Search ──
        SearchResult: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                results: { type: "array", items: { type: "object" } },
                total: { type: "integer" },
              },
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: "Missing or invalid authentication token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: { success: false, message: "Unauthorized" },
            },
          },
        },
        Forbidden: {
          description: "Insufficient permissions",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: { success: false, message: "Forbidden" },
            },
          },
        },
        NotFound: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: { success: false, message: "Resource not found" },
            },
          },
        },
        ValidationError: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication — login, logout, token refresh, password reset" },
      { name: "Sites", description: "Hospital sites and locations" },
      { name: "Services", description: "Medical services and departments" },
      { name: "Doctors", description: "Medical staff directory" },
      { name: "Events", description: "Hospital events and announcements" },
      { name: "Jobs", description: "Job openings and career opportunities" },
      { name: "Newborns", description: "Newborn birth announcements" },
      { name: "Patient Info", description: "Patient information and guides" },
      { name: "Emergency Hotlines", description: "Emergency contact numbers" },
      { name: "Appointments", description: "Appointment types (reference data)" },
      { name: "Appointment Bookings", description: "Book, lookup, and cancel appointments" },
      { name: "Search", description: "Full-text search across resources" },
      { name: "Admin — Dashboard", description: "Admin dashboard statistics" },
      { name: "Admin — Profile", description: "Admin user profile management" },
      { name: "Admin — Sites", description: "Manage hospital sites" },
      { name: "Admin — Services", description: "Manage services, contacts, and links" },
      { name: "Admin — Doctors", description: "Manage medical staff" },
      { name: "Admin — Events", description: "Manage events" },
      { name: "Admin — Jobs", description: "Manage job openings" },
      { name: "Admin — Newborns", description: "Manage newborn records" },
      { name: "Admin — Patient Info", description: "Manage patient information pages" },
      { name: "Admin — Emergency Hotlines", description: "Manage emergency hotlines" },
      { name: "Admin — Appointments", description: "Manage appointment types" },
      { name: "Admin — Appointment Bookings", description: "Manage appointment bookings" },
      { name: "Admin — Users", description: "User management" },
      { name: "Admin — Roles", description: "Role management (super_admin only)" },
      { name: "Admin — Permissions", description: "Permission listing (super_admin only)" },
      { name: "Admin — Uploads", description: "Image upload management" },
    ],
    paths: {
      // ════════════════════════════════════════
      // AUTH
      // ════════════════════════════════════════
      "/api/v1/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login",
          description: "Authenticate with email and password to receive access and refresh tokens.",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
          },
          responses: {
            200: { description: "Login successful", content: { "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } } } },
            401: { description: "Invalid credentials" },
            422: { $ref: "#/components/responses/ValidationError" },
          },
        },
      },
      "/api/v1/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh token",
          description: "Exchange a valid refresh token for a new access token.",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/RefreshTokenRequest" } } },
          },
          responses: {
            200: { description: "Token refreshed" },
            401: { description: "Invalid refresh token" },
          },
        },
      },
      "/api/v1/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout",
          description: "Invalidate the refresh token.",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/RefreshTokenRequest" } } },
          },
          responses: {
            200: { description: "Logged out" },
          },
        },
      },
      "/api/v1/auth/forgot-password": {
        post: {
          tags: ["Auth"],
          summary: "Forgot password",
          description: "Send a password reset email.",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/ForgotPasswordRequest" } } },
          },
          responses: {
            200: { description: "Reset email sent (if account exists)" },
          },
        },
      },
      "/api/v1/auth/reset-password": {
        post: {
          tags: ["Auth"],
          summary: "Reset password",
          description: "Reset password using the token from the email.",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/ResetPasswordRequest" } } },
          },
          responses: {
            200: { description: "Password reset successful" },
            400: { description: "Invalid or expired token" },
          },
        },
      },

      // ════════════════════════════════════════
      // PUBLIC — SITES
      // ════════════════════════════════════════
      "/api/v1/sites": {
        get: {
          tags: ["Sites"],
          summary: "List all sites",
          parameters: [{ $ref: "#/components/parameters/AcceptLanguage" }],
          responses: {
            200: { description: "List of hospital sites", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/Site" } } } } } } },
          },
        },
      },
      "/api/v1/sites/{slug}": {
        get: {
          tags: ["Sites"],
          summary: "Get site by slug",
          parameters: [{ $ref: "#/components/parameters/SlugParam" }, { $ref: "#/components/parameters/AcceptLanguage" }],
          responses: {
            200: { description: "Site details", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Site" } } } } } },
            404: { $ref: "#/components/responses/NotFound" },
          },
        },
      },

      // ════════════════════════════════════════
      // PUBLIC — SERVICES
      // ════════════════════════════════════════
      "/api/v1/services": {
        get: {
          tags: ["Services"],
          summary: "List services",
          parameters: [
            { in: "query", name: "category", schema: { type: "string" }, description: "Filter by category" },
            { in: "query", name: "site", schema: { type: "string" }, description: "Filter by site ID" },
            { in: "query", name: "search", schema: { type: "string" }, description: "Search term" },
            { $ref: "#/components/parameters/AcceptLanguage" },
          ],
          responses: {
            200: { description: "List of services", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/Service" } } } } } } },
          },
        },
      },
      "/api/v1/services/{slug}": {
        get: {
          tags: ["Services"],
          summary: "Get service by slug",
          parameters: [{ $ref: "#/components/parameters/SlugParam" }, { $ref: "#/components/parameters/AcceptLanguage" }],
          responses: {
            200: { description: "Service details" },
            404: { $ref: "#/components/responses/NotFound" },
          },
        },
      },

      // ════════════════════════════════════════
      // PUBLIC — DOCTORS
      // ════════════════════════════════════════
      "/api/v1/doctors": {
        get: {
          tags: ["Doctors"],
          summary: "List doctors",
          parameters: [
            { in: "query", name: "service", schema: { type: "string" }, description: "Filter by service ID" },
            { in: "query", name: "site", schema: { type: "string" }, description: "Filter by site ID" },
            { in: "query", name: "search", schema: { type: "string" }, description: "Search term" },
            { $ref: "#/components/parameters/AcceptLanguage" },
          ],
          responses: { 200: { description: "List of doctors" } },
        },
      },
      "/api/v1/doctors/{id}": {
        get: {
          tags: ["Doctors"],
          summary: "Get doctor by ID",
          parameters: [{ $ref: "#/components/parameters/IdParam" }, { $ref: "#/components/parameters/AcceptLanguage" }],
          responses: { 200: { description: "Doctor details" }, 404: { $ref: "#/components/responses/NotFound" } },
        },
      },

      // ════════════════════════════════════════
      // PUBLIC — EVENTS
      // ════════════════════════════════════════
      "/api/v1/events": {
        get: {
          tags: ["Events"],
          summary: "List events",
          parameters: [{ $ref: "#/components/parameters/AcceptLanguage" }],
          responses: { 200: { description: "List of events" } },
        },
      },
      "/api/v1/events/{slug}": {
        get: {
          tags: ["Events"],
          summary: "Get event by slug",
          parameters: [{ $ref: "#/components/parameters/SlugParam" }, { $ref: "#/components/parameters/AcceptLanguage" }],
          responses: { 200: { description: "Event details" }, 404: { $ref: "#/components/responses/NotFound" } },
        },
      },

      // ════════════════════════════════════════
      // PUBLIC — JOBS
      // ════════════════════════════════════════
      "/api/v1/jobs": {
        get: {
          tags: ["Jobs"],
          summary: "List jobs",
          parameters: [
            { in: "query", name: "category", schema: { type: "string" }, description: "Filter by category" },
            { in: "query", name: "site", schema: { type: "string" }, description: "Filter by site ID" },
            { in: "query", name: "type", schema: { type: "string", enum: ["full-time", "part-time", "temporary", "internship"] }, description: "Employment type" },
            { $ref: "#/components/parameters/AcceptLanguage" },
          ],
          responses: { 200: { description: "List of jobs" } },
        },
      },
      "/api/v1/jobs/{id}": {
        get: {
          tags: ["Jobs"],
          summary: "Get job by ID",
          parameters: [{ $ref: "#/components/parameters/IdParam" }, { $ref: "#/components/parameters/AcceptLanguage" }],
          responses: { 200: { description: "Job details" }, 404: { $ref: "#/components/responses/NotFound" } },
        },
      },

      // ════════════════════════════════════════
      // PUBLIC — NEWBORNS
      // ════════════════════════════════════════
      "/api/v1/newborns": {
        get: {
          tags: ["Newborns"],
          summary: "List newborns",
          parameters: [{ $ref: "#/components/parameters/AcceptLanguage" }],
          responses: { 200: { description: "List of newborn announcements" } },
        },
      },

      // ════════════════════════════════════════
      // PUBLIC — PATIENT INFO
      // ════════════════════════════════════════
      "/api/v1/patient-info": {
        get: {
          tags: ["Patient Info"],
          summary: "List patient info pages",
          parameters: [
            { in: "query", name: "section", schema: { type: "string" }, description: "Filter by section" },
            { $ref: "#/components/parameters/AcceptLanguage" },
          ],
          responses: { 200: { description: "List of patient info" } },
        },
      },
      "/api/v1/patient-info/{slug}": {
        get: {
          tags: ["Patient Info"],
          summary: "Get patient info by slug",
          parameters: [{ $ref: "#/components/parameters/SlugParam" }, { $ref: "#/components/parameters/AcceptLanguage" }],
          responses: { 200: { description: "Patient info details" }, 404: { $ref: "#/components/responses/NotFound" } },
        },
      },

      // ════════════════════════════════════════
      // PUBLIC — EMERGENCY HOTLINES
      // ════════════════════════════════════════
      "/api/v1/emergency-hotlines": {
        get: {
          tags: ["Emergency Hotlines"],
          summary: "List emergency hotlines",
          parameters: [{ $ref: "#/components/parameters/AcceptLanguage" }],
          responses: { 200: { description: "List of emergency hotlines" } },
        },
      },
      "/api/v1/emergency-hotlines/{slug}": {
        get: {
          tags: ["Emergency Hotlines"],
          summary: "Get hotline by slug",
          parameters: [{ $ref: "#/components/parameters/SlugParam" }, { $ref: "#/components/parameters/AcceptLanguage" }],
          responses: { 200: { description: "Hotline details" }, 404: { $ref: "#/components/responses/NotFound" } },
        },
      },

      // ════════════════════════════════════════
      // PUBLIC — APPOINTMENTS
      // ════════════════════════════════════════
      "/api/v1/appointments": {
        get: {
          tags: ["Appointments"],
          summary: "List appointment types",
          parameters: [{ $ref: "#/components/parameters/AcceptLanguage" }],
          responses: { 200: { description: "List of appointment types" } },
        },
      },
      "/api/v1/appointments/{slug}": {
        get: {
          tags: ["Appointments"],
          summary: "Get appointment type by slug",
          parameters: [{ $ref: "#/components/parameters/SlugParam" }, { $ref: "#/components/parameters/AcceptLanguage" }],
          responses: { 200: { description: "Appointment type details" }, 404: { $ref: "#/components/responses/NotFound" } },
        },
      },

      // ════════════════════════════════════════
      // PUBLIC — APPOINTMENT BOOKINGS
      // ════════════════════════════════════════
      "/api/v1/appointment-bookings/slots": {
        get: {
          tags: ["Appointment Bookings"],
          summary: "Get available slots",
          description: "Retrieve available time slots for a given appointment type and date.",
          parameters: [
            { in: "query", name: "appointment_type", required: true, schema: { type: "string", enum: ["adult", "child", "doctor"] } },
            { in: "query", name: "date", required: true, schema: { type: "string", format: "date" }, description: "YYYY-MM-DD" },
            { in: "query", name: "site_id", schema: { type: "string" }, description: "Filter by site" },
          ],
          responses: { 200: { description: "Available time slots" } },
        },
      },
      "/api/v1/appointment-bookings": {
        post: {
          tags: ["Appointment Bookings"],
          summary: "Create booking",
          description: "Book an appointment. Returns a booking reference for tracking.",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreateBooking" } } },
          },
          responses: {
            201: { description: "Booking created", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/AppointmentBooking" } } } } } },
            422: { $ref: "#/components/responses/ValidationError" },
          },
        },
      },
      "/api/v1/appointment-bookings/{reference}": {
        get: {
          tags: ["Appointment Bookings"],
          summary: "Lookup booking",
          description: "Retrieve a booking by its reference number.",
          parameters: [{ in: "path", name: "reference", required: true, schema: { type: "string" }, description: "Booking reference (e.g. RHN-XXXXXX)" }],
          responses: {
            200: { description: "Booking details" },
            404: { $ref: "#/components/responses/NotFound" },
          },
        },
      },
      "/api/v1/appointment-bookings/{reference}/cancel": {
        put: {
          tags: ["Appointment Bookings"],
          summary: "Cancel booking",
          description: "Cancel a pending or confirmed booking.",
          parameters: [{ in: "path", name: "reference", required: true, schema: { type: "string" } }],
          requestBody: {
            content: { "application/json": { schema: { type: "object", properties: { reason: { type: "string" } } } } },
          },
          responses: {
            200: { description: "Booking cancelled" },
            404: { $ref: "#/components/responses/NotFound" },
          },
        },
      },

      // ════════════════════════════════════════
      // PUBLIC — SEARCH
      // ════════════════════════════════════════
      "/api/v1/search": {
        get: {
          tags: ["Search"],
          summary: "Search across resources",
          description: "Full-text search across sites, services, doctors, events, jobs, and more.",
          parameters: [
            { in: "query", name: "q", required: true, schema: { type: "string" }, description: "Search query" },
            { in: "query", name: "lang", schema: { type: "string", enum: ["fr", "en", "de", "it"] }, description: "Search language" },
            { in: "query", name: "limit", schema: { type: "integer", minimum: 1, maximum: 50, default: 10 }, description: "Max results" },
            { in: "query", name: "resources", schema: { type: "string" }, description: "Comma-separated resource types to search" },
          ],
          responses: { 200: { description: "Search results", content: { "application/json": { schema: { $ref: "#/components/schemas/SearchResult" } } } } },
        },
      },

      // ════════════════════════════════════════
      // ADMIN — DASHBOARD
      // ════════════════════════════════════════
      "/api/v1/admin/dashboard/stats": {
        get: {
          tags: ["Admin — Dashboard"],
          summary: "Dashboard statistics",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Dashboard stats" }, 401: { $ref: "#/components/responses/Unauthorized" } },
        },
      },

      // ════════════════════════════════════════
      // ADMIN — PROFILE
      // ════════════════════════════════════════
      "/api/v1/admin/profile": {
        get: {
          tags: ["Admin — Profile"],
          summary: "Get my profile",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Current user profile" } },
        },
        put: {
          tags: ["Admin — Profile"],
          summary: "Update my profile",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { first_name: { type: "string" }, last_name: { type: "string" }, email: { type: "string", format: "email" } } } } } },
          responses: { 200: { description: "Profile updated" } },
        },
      },
      "/api/v1/admin/profile/password": {
        put: {
          tags: ["Admin — Profile"],
          summary: "Change my password",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["current_password", "new_password", "new_password_confirm"], properties: { current_password: { type: "string" }, new_password: { type: "string" }, new_password_confirm: { type: "string" } } } } } },
          responses: { 200: { description: "Password changed" } },
        },
      },

      // ════════════════════════════════════════
      // ADMIN — SITES
      // ════════════════════════════════════════
      "/api/v1/admin/sites": {
        get: {
          tags: ["Admin — Sites"],
          summary: "List all sites",
          description: "Requires `sites.read` permission.",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "List of sites" }, 401: { $ref: "#/components/responses/Unauthorized" }, 403: { $ref: "#/components/responses/Forbidden" } },
        },
        post: {
          tags: ["Admin — Sites"],
          summary: "Create site",
          description: "Requires `sites.read` permission.",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateSite" } } } },
          responses: { 201: { description: "Site created" }, 422: { $ref: "#/components/responses/ValidationError" } },
        },
      },
      "/api/v1/admin/sites/{id}": {
        get: {
          tags: ["Admin — Sites"],
          summary: "Get site by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/IdParam" }],
          responses: { 200: { description: "Site details" }, 404: { $ref: "#/components/responses/NotFound" } },
        },
        put: {
          tags: ["Admin — Sites"],
          summary: "Update site",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/IdParam" }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateSite" } } } },
          responses: { 200: { description: "Site updated" } },
        },
        delete: {
          tags: ["Admin — Sites"],
          summary: "Delete site",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/IdParam" }],
          responses: { 200: { description: "Site deleted" }, 404: { $ref: "#/components/responses/NotFound" } },
        },
      },

      // ════════════════════════════════════════
      // ADMIN — SERVICES
      // ════════════════════════════════════════
      "/api/v1/admin/services": {
        get: { tags: ["Admin — Services"], summary: "List all services", security: [{ bearerAuth: [] }], responses: { 200: { description: "List of services" } } },
        post: { tags: ["Admin — Services"], summary: "Create service", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 201: { description: "Service created" } } },
      },
      "/api/v1/admin/services/{id}": {
        get: { tags: ["Admin — Services"], summary: "Get service by ID", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Service details" } } },
        put: { tags: ["Admin — Services"], summary: "Update service", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Service updated" } } },
        delete: { tags: ["Admin — Services"], summary: "Delete service", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Service deleted" } } },
      },
      "/api/v1/admin/services/{id}/contacts": {
        get: { tags: ["Admin — Services"], summary: "List service contacts", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Service contacts" } } },
        post: { tags: ["Admin — Services"], summary: "Add service contact", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 201: { description: "Contact added" } } },
      },
      "/api/v1/admin/services/{id}/links": {
        get: { tags: ["Admin — Services"], summary: "List service links", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Service links" } } },
        post: { tags: ["Admin — Services"], summary: "Add service link", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 201: { description: "Link added" } } },
      },
      "/api/v1/admin/service-contacts/{id}": {
        put: { tags: ["Admin — Services"], summary: "Update service contact", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Contact updated" } } },
        delete: { tags: ["Admin — Services"], summary: "Delete service contact", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Contact deleted" } } },
      },
      "/api/v1/admin/service-links/{id}": {
        put: { tags: ["Admin — Services"], summary: "Update service link", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Link updated" } } },
        delete: { tags: ["Admin — Services"], summary: "Delete service link", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Link deleted" } } },
      },

      // ════════════════════════════════════════
      // ADMIN — DOCTORS
      // ════════════════════════════════════════
      "/api/v1/admin/doctors": {
        get: { tags: ["Admin — Doctors"], summary: "List all doctors", security: [{ bearerAuth: [] }], responses: { 200: { description: "List of doctors" } } },
        post: { tags: ["Admin — Doctors"], summary: "Create doctor", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 201: { description: "Doctor created" } } },
      },
      "/api/v1/admin/doctors/{id}": {
        get: { tags: ["Admin — Doctors"], summary: "Get doctor by ID", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Doctor details" } } },
        put: { tags: ["Admin — Doctors"], summary: "Update doctor", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Doctor updated" } } },
        delete: { tags: ["Admin — Doctors"], summary: "Delete doctor", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Doctor deleted" } } },
      },

      // ════════════════════════════════════════
      // ADMIN — EVENTS
      // ════════════════════════════════════════
      "/api/v1/admin/events": {
        get: { tags: ["Admin — Events"], summary: "List all events", security: [{ bearerAuth: [] }], responses: { 200: { description: "List of events" } } },
        post: { tags: ["Admin — Events"], summary: "Create event", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 201: { description: "Event created" } } },
      },
      "/api/v1/admin/events/{id}": {
        get: { tags: ["Admin — Events"], summary: "Get event by ID", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Event details" } } },
        put: { tags: ["Admin — Events"], summary: "Update event", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Event updated" } } },
        delete: { tags: ["Admin — Events"], summary: "Delete event", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Event deleted" } } },
      },

      // ════════════════════════════════════════
      // ADMIN — JOBS
      // ════════════════════════════════════════
      "/api/v1/admin/jobs": {
        get: { tags: ["Admin — Jobs"], summary: "List all jobs", security: [{ bearerAuth: [] }], responses: { 200: { description: "List of jobs" } } },
        post: { tags: ["Admin — Jobs"], summary: "Create job", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 201: { description: "Job created" } } },
      },
      "/api/v1/admin/jobs/{id}": {
        get: { tags: ["Admin — Jobs"], summary: "Get job by ID", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Job details" } } },
        put: { tags: ["Admin — Jobs"], summary: "Update job", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Job updated" } } },
        delete: { tags: ["Admin — Jobs"], summary: "Delete job", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Job deleted" } } },
      },

      // ════════════════════════════════════════
      // ADMIN — NEWBORNS
      // ════════════════════════════════════════
      "/api/v1/admin/newborns": {
        get: { tags: ["Admin — Newborns"], summary: "List all newborns", security: [{ bearerAuth: [] }], responses: { 200: { description: "List of newborns" } } },
        post: { tags: ["Admin — Newborns"], summary: "Create newborn", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 201: { description: "Newborn created" } } },
      },
      "/api/v1/admin/newborns/{id}": {
        get: { tags: ["Admin — Newborns"], summary: "Get newborn by ID", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Newborn details" } } },
        put: { tags: ["Admin — Newborns"], summary: "Update newborn", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Newborn updated" } } },
        delete: { tags: ["Admin — Newborns"], summary: "Delete newborn", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Newborn deleted" } } },
      },

      // ════════════════════════════════════════
      // ADMIN — PATIENT INFO
      // ════════════════════════════════════════
      "/api/v1/admin/patient-info": {
        get: { tags: ["Admin — Patient Info"], summary: "List all patient info", security: [{ bearerAuth: [] }], responses: { 200: { description: "List of patient info" } } },
        post: { tags: ["Admin — Patient Info"], summary: "Create patient info", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 201: { description: "Patient info created" } } },
      },
      "/api/v1/admin/patient-info/{id}": {
        get: { tags: ["Admin — Patient Info"], summary: "Get patient info by ID", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Patient info details" } } },
        put: { tags: ["Admin — Patient Info"], summary: "Update patient info", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Patient info updated" } } },
        delete: { tags: ["Admin — Patient Info"], summary: "Delete patient info", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Patient info deleted" } } },
      },

      // ════════════════════════════════════════
      // ADMIN — EMERGENCY HOTLINES
      // ════════════════════════════════════════
      "/api/v1/admin/emergency-hotlines": {
        get: { tags: ["Admin — Emergency Hotlines"], summary: "List all hotlines", security: [{ bearerAuth: [] }], responses: { 200: { description: "List of hotlines" } } },
        post: { tags: ["Admin — Emergency Hotlines"], summary: "Create hotline", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 201: { description: "Hotline created" } } },
      },
      "/api/v1/admin/emergency-hotlines/{id}": {
        get: { tags: ["Admin — Emergency Hotlines"], summary: "Get hotline by ID", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Hotline details" } } },
        put: { tags: ["Admin — Emergency Hotlines"], summary: "Update hotline", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Hotline updated" } } },
        delete: { tags: ["Admin — Emergency Hotlines"], summary: "Delete hotline", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Hotline deleted" } } },
      },

      // ════════════════════════════════════════
      // ADMIN — APPOINTMENTS
      // ════════════════════════════════════════
      "/api/v1/admin/appointments": {
        get: { tags: ["Admin — Appointments"], summary: "List all appointment types", security: [{ bearerAuth: [] }], responses: { 200: { description: "List of appointment types" } } },
        post: { tags: ["Admin — Appointments"], summary: "Create appointment type", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 201: { description: "Appointment type created" } } },
      },
      "/api/v1/admin/appointments/{id}": {
        get: { tags: ["Admin — Appointments"], summary: "Get appointment type by ID", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Appointment type details" } } },
        put: { tags: ["Admin — Appointments"], summary: "Update appointment type", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Appointment type updated" } } },
        delete: { tags: ["Admin — Appointments"], summary: "Delete appointment type", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Appointment type deleted" } } },
      },

      // ════════════════════════════════════════
      // ADMIN — APPOINTMENT BOOKINGS
      // ════════════════════════════════════════
      "/api/v1/admin/appointment-bookings": {
        get: {
          tags: ["Admin — Appointment Bookings"],
          summary: "List all bookings",
          description: "Requires `appointments.read` permission. Supports filtering by status, date range, site.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "query", name: "status", schema: { type: "string", enum: ["pending", "confirmed", "cancelled", "completed", "no_show"] } },
            { in: "query", name: "page", schema: { type: "integer", default: 1 } },
            { in: "query", name: "limit", schema: { type: "integer", default: 10 } },
          ],
          responses: { 200: { description: "Paginated list of bookings" } },
        },
      },
      "/api/v1/admin/appointment-bookings/{id}": {
        get: { tags: ["Admin — Appointment Bookings"], summary: "Get booking by ID", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Booking details" } } },
        delete: { tags: ["Admin — Appointment Bookings"], summary: "Delete booking", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Booking deleted" } } },
      },
      "/api/v1/admin/appointment-bookings/{id}/status": {
        put: {
          tags: ["Admin — Appointment Bookings"],
          summary: "Update booking status",
          description: "Change a booking's status (confirm, cancel, complete, mark no-show).",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/IdParam" }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateBookingStatus" } } } },
          responses: { 200: { description: "Status updated" } },
        },
      },

      // ════════════════════════════════════════
      // ADMIN — USERS
      // ════════════════════════════════════════
      "/api/v1/admin/users": {
        get: { tags: ["Admin — Users"], summary: "List all users", description: "Requires `users.read` permission.", security: [{ bearerAuth: [] }], responses: { 200: { description: "List of users" } } },
        post: { tags: ["Admin — Users"], summary: "Create user", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["first_name", "last_name", "email", "password"], properties: { first_name: { type: "string" }, last_name: { type: "string" }, email: { type: "string", format: "email" }, password: { type: "string", minLength: 8 } } } } } }, responses: { 201: { description: "User created" } } },
      },
      "/api/v1/admin/users/{id}": {
        get: { tags: ["Admin — Users"], summary: "Get user by ID", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "User details" } } },
        put: { tags: ["Admin — Users"], summary: "Update user", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "User updated" } } },
        delete: { tags: ["Admin — Users"], summary: "Delete user", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "User deleted" } } },
      },
      "/api/v1/admin/users/{id}/roles": {
        put: {
          tags: ["Admin — Users"],
          summary: "Assign roles to user",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/IdParam" }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["roles"], properties: { roles: { type: "array", items: { type: "string" } } } } } } },
          responses: { 200: { description: "Roles assigned" } },
        },
      },

      // ════════════════════════════════════════
      // ADMIN — ROLES
      // ════════════════════════════════════════
      "/api/v1/admin/roles": {
        get: { tags: ["Admin — Roles"], summary: "List all roles", description: "Requires `super_admin` role.", security: [{ bearerAuth: [] }], responses: { 200: { description: "List of roles" } } },
        post: { tags: ["Admin — Roles"], summary: "Create role", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name"], properties: { name: { type: "string" }, description: { type: "string" } } } } } }, responses: { 201: { description: "Role created" } } },
      },
      "/api/v1/admin/roles/{id}": {
        get: { tags: ["Admin — Roles"], summary: "Get role by ID", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Role details" } } },
        put: { tags: ["Admin — Roles"], summary: "Update role", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Role updated" } } },
        delete: { tags: ["Admin — Roles"], summary: "Delete role", security: [{ bearerAuth: [] }], parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Role deleted" } } },
      },
      "/api/v1/admin/roles/{id}/permissions": {
        put: {
          tags: ["Admin — Roles"],
          summary: "Assign permissions to role",
          security: [{ bearerAuth: [] }],
          parameters: [{ $ref: "#/components/parameters/IdParam" }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["permissions"], properties: { permissions: { type: "array", items: { type: "string" } } } } } } },
          responses: { 200: { description: "Permissions assigned" } },
        },
      },

      // ════════════════════════════════════════
      // ADMIN — PERMISSIONS
      // ════════════════════════════════════════
      "/api/v1/admin/permissions": {
        get: { tags: ["Admin — Permissions"], summary: "List all permissions", description: "Requires `super_admin` role.", security: [{ bearerAuth: [] }], responses: { 200: { description: "List of permissions" } } },
      },

      // ════════════════════════════════════════
      // ADMIN — UPLOADS
      // ════════════════════════════════════════
      "/api/v1/admin/uploads/images": {
        post: {
          tags: ["Admin — Uploads"],
          summary: "Upload general image",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { image: { type: "string", format: "binary" } } } } } },
          responses: { 200: { description: "Image uploaded", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "object", properties: { url: { type: "string" }, public_id: { type: "string" } } } } } } } } },
        },
        delete: {
          tags: ["Admin — Uploads"],
          summary: "Delete image",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["public_id"], properties: { public_id: { type: "string" } } } } } },
          responses: { 200: { description: "Image deleted" } },
        },
      },
      "/api/v1/admin/uploads/images/sites": {
        post: {
          tags: ["Admin — Uploads"],
          summary: "Upload site image",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { image: { type: "string", format: "binary" } } } } } },
          responses: { 200: { description: "Image uploaded" } },
        },
      },
      "/api/v1/admin/uploads/images/services": {
        post: {
          tags: ["Admin — Uploads"],
          summary: "Upload service image",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { image: { type: "string", format: "binary" } } } } } },
          responses: { 200: { description: "Image uploaded" } },
        },
      },
      "/api/v1/admin/uploads/images/doctors": {
        post: {
          tags: ["Admin — Uploads"],
          summary: "Upload doctor image",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { image: { type: "string", format: "binary" } } } } } },
          responses: { 200: { description: "Image uploaded" } },
        },
      },
      "/api/v1/admin/uploads/images/events": {
        post: {
          tags: ["Admin — Uploads"],
          summary: "Upload event image",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { image: { type: "string", format: "binary" } } } } } },
          responses: { 200: { description: "Image uploaded" } },
        },
      },
      "/api/v1/admin/uploads/images/newborns": {
        post: {
          tags: ["Admin — Uploads"],
          summary: "Upload newborn image",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { image: { type: "string", format: "binary" } } } } } },
          responses: { 200: { description: "Image uploaded" } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
