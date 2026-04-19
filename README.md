# RHNe API

Backend for the RHNe (Réseau hospitalier neuchâtelois) hospital network. Handles sites, services, doctors, events, job postings, patient info, online appointments, and more — all in four languages.

Built with Node.js 20, Express 5, TypeScript, MongoDB 7, and Redis 7.

## Getting started

You need Node.js 20+, Docker, and Docker Compose.

```bash
cp .env.example .env          # configure your local settings
docker compose up -d           # MongoDB, Redis, Mailpit, Mongo-Express
npm install
npm run seed                   # populates ~1500 records across 15 collections
npm run dev                    # http://localhost:5000/api/v1
```

`npm run seed:fresh` drops everything and re-seeds from scratch.

## Dev services

| Service | URL |
| --- | --- |
| API | http://localhost:5000/api/v1 |
| Mailpit | http://localhost:8025 |
| Mongo Express | http://localhost:8081 |

## Scripts

```
npm run dev           # dev server with hot-reload
npm run build         # compile to dist/
npm start             # run compiled output
npm run seed          # seed data (skip duplicates)
npm run seed:fresh    # drop + re-seed
npm test              # 77 integration tests (Jest)
npm run lint          # ESLint
```

## API overview

Base path: `/api/v1`

**Public** — no auth needed:

- `/sites`, `/services`, `/doctors` — hospital data
- `/events`, `/jobs`, `/newborns` — announcements
- `/patient-info`, `/emergency-hotlines` — reference pages
- `/appointments` — appointment types
- `/appointment-bookings` — book, look up, cancel appointments
- `/search?q=...` — full-text search across resources

**Auth:**

- `POST /auth/login` → access token (15 min) + refresh token (7 days)
- `POST /auth/refresh`, `POST /auth/logout`
- `POST /auth/forgot-password`, `POST /auth/reset-password`

**Admin** — JWT + role-based access:

- `/admin/dashboard/stats` — overview
- CRUD on all resources under `/admin/sites`, `/admin/services`, etc.
- `/admin/appointment-bookings` — manage patient bookings
- `/admin/users`, `/admin/roles`, `/admin/permissions`
- `/admin/uploads/images` — Cloudinary upload

All list endpoints accept `?page=`, `?limit=`, `?sort=`, `?search=`, `?lang=`.

## Responses

```json
{
  "success": true,
  "message": "Sites retrieved successfully",
  "data": [],
  "pagination": { "page": 1, "limit": 20, "total": 7, "totalPages": 1 }
}
```

## Languages

Content is stored in four languages (FR, EN, DE, IT). The API picks the language from `?lang=fr`, the `Accept-Language` header, or defaults to French.

## Auth & roles

| Role | Access |
| --- | --- |
| super_admin | Everything |
| admin | Platform management |
| content_editor | Services, events, patient info |
| hr_manager | Job postings |
| site_manager | Specific hospital site |

## Testing

```bash
npm test          # runs against a separate rhne_test database
```

Requires MongoDB and Redis to be running.

## Docker (production)

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## License

Private — All rights reserved.
