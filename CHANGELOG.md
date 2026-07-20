# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Phase 1 — Backend Setup (Express + Prisma + PostgreSQL)
- Initialized `server/` directory with Express.js 4.21, TypeScript 5.9, and Prisma ORM 6.19.
- Created **19-table PostgreSQL schema** (`server/prisma/schema.prisma`) with 7 enums and full relational integrity:
  - `User`, `Session`, `Book`, `Category`, `Author`, `Publisher`, `Address`
  - `Order`, `OrderItem`, `Review`, `WishlistItem`, `CartItem`
  - `HomepageCMS`, `Media`, `Settings`, `ActivityLog`, `Notification`, `Coupon`, `InventoryHistory`
- Implemented production middleware stack in `server/src/app.ts`:
  - Helmet (secure HTTP headers)
  - CORS (credentialed, configurable origin)
  - Compression
  - Express JSON & URL-encoded body parsing (10MB limit)
  - Cookie Parser
  - Request ID tracing (UUID per request via `X-Request-Id`)
  - Tiered Rate Limiting (auth: 5/15min, import: 2/min, general: 100/min, admin: 200/min)
  - Centralized Error Handler (AppError class, no stack trace leakage in prod)
- Created Winston structured JSON logging (`server/src/config/logger.ts`) with file + console transports.
- Created Zod-validated environment configuration (`server/src/config/env.ts`) — fails fast on missing secrets.
- Created Swagger/OpenAPI 3.0 documentation at `/docs` (`server/src/config/swagger.ts`).
- Created health check endpoints: `GET /health`, `GET /ready` (DB ping), `GET /live`.
- Created versioned API router: all future endpoints under `/api/v1/`.
- Created Prisma singleton (`server/src/config/database.ts`) with graceful shutdown on SIGTERM/SIGINT.
- Created Zod validation middleware (`server/src/middlewares/validate.ts`).
- Created `.env.example` with all required environment variable templates.
- **TypeScript compilation: ZERO ERRORS.**

### Phase 0 — Architecture & Database Design
- Created `SECURITY.md` detailing mandatory OWASP compliance, RBAC, input validation (Zod), and secure token handling for production.
- Created initial `PROJECT_ARCHITECTURE.md` to document the static frontend state.
- Formulated a 15-phase roadmap to build a production-ready Express + Prisma + PostgreSQL backend for a fully-featured Admin CMS.
- Designed the backend folder structure, REST API specifications, and Database ER Diagram (Phase 0).
- Defined strict controller-service-repository patterns and 100% completion rules for feature modules.
