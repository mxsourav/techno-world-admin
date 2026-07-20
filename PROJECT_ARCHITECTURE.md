# 1. Project Overview
- **Purpose of the application**: An e-commerce platform for purchasing books (academic, fiction, etc.). Features cart, wishlist, checkout, and a comprehensive Admin CMS.
- **Tech stack**: 
  - **Frontend**: React 19, TypeScript, Vite, TailwindCSS, React Router, React Hook Form, Zod
  - **Backend**: Node.js, Express.js, TypeScript
  - **Database**: PostgreSQL, Prisma ORM
  - **Authentication**: JWT, Refresh Token, bcrypt
  - **Storage**: Local (Dev) / Cloudinary (Prod)
  - **Payment**: Razorpay
- **Deployment method**: Static frontend and Node.js backend via Render. Database on PostgreSQL provider.

# 2. Folder Structure
- `src/`: The core source code of the React frontend.
- `server/`: The Express.js backend codebase.
  - `src/config/`: Environment, DB connection, Cloudinary config.
  - `src/controllers/`: Request parsing & HTTP responses.
  - `src/services/`: Core business logic.
  - `src/repositories/`: Database access layer (Prisma wrappers).
  - `src/routes/`: Express routers mapping to controllers.
  - `src/middlewares/`: Auth, error handling, file uploads.
  - `src/utils/`: Helper functions.
  - `src/validators/`: Zod schemas for API payload validation.
  - `src/types/`: TypeScript interfaces.
  - `src/app.ts`: Express application setup.
  - `src/server.ts`: Entry point.
- `prisma/`: Prisma schema, migrations, and seeders.
- `uploads/`: Local temporary file storage.
- `logs/`: Application logs.
- `scripts/`: CLI utilities for build/data extraction.
- `tests/`: Jest test cases.

# 3. Entry Points
- **Frontend entry**: `src/main.tsx` (Mounts React to `#root`) and `index.html`.
- **Backend entry**: `server/src/server.ts`.
- **Main routing (Frontend)**: `src/App.tsx`.
- **Main routing (Backend)**: `server/src/routes/index.ts`.

# 4. REST API Design (Versioned: `/api/v1/`)
- **Health**: `GET /health`, `GET /ready`, `GET /live`
- **Docs**: `GET /docs` (Swagger UI)
- **Auth**: `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/change-password`
- **Books**: `GET /api/v1/books`, `GET /api/v1/books/:id`, `POST /api/v1/books`, `PUT /api/v1/books/:id`, `DELETE /api/v1/books/:id`
- **Orders**: `GET /api/v1/orders`, `GET /api/v1/orders/:id`, `PUT /api/v1/orders/:id/status`
- **Categories**: `GET /api/v1/categories` (+ POST/PUT/DELETE)
- **Authors**: `GET /api/v1/authors` (+ POST/PUT/DELETE)
- **Publishers**: `GET /api/v1/publishers` (+ POST/PUT/DELETE)
- **Dashboard & CMS**: `GET /api/v1/dashboard`, `GET /api/v1/cms`, `PUT /api/v1/cms`
- **System**: `POST /api/v1/import`, `POST /api/v1/export`

# 5. Database Architecture (ER Diagram & Schema)
- **Database type**: PostgreSQL.
- **ORM**: Prisma.
- **Models (19 tables)**:
  - `User`, `Session`, `Book`, `Category`, `Author`, `Publisher`, `Address`
  - `Order`, `OrderItem`, `Review`, `WishlistItem`, `CartItem`
  - `HomepageCMS`, `Media`, `Settings`, `ActivityLog`, `Notification`, `Coupon`, `InventoryHistory`
- **Enums (7)**: `Role`, `BookStatus`, `OrderStatus`, `PaymentStatus`, `CouponType`, `MediaType`, `ActivityAction`
- **Schema file**: `server/prisma/schema.prisma`

# 6. Authentication & Roles Architecture
- **Auth Flow**: JWT-based with Refresh Tokens securely stored. Passwords hashed via bcrypt.
- **Roles Hierarchy**: Super Admin > Admin > Content Manager > Order Manager > Employee.

# 7. Architecture Guidelines (Strict Rules)
1. **Never write business logic in controllers.** Always use: `Route → Controller → Service → Repository → Prisma → Database`.
2. **100% Completion per feature.** A module (e.g., Books) must be entirely finished front-to-back before moving to the next.
3. **Continuous Documentation.** Always update `CHANGELOG.md`, `SECURITY.md`, and this document after every phase.
4. **Security First.** Follow `SECURITY.md` (OWASP, Zod validation, secure cookies, bcrypt, rate limiting, RBAC).
5. **Golden Rule.** Before creating new code: search existing project, reuse components/APIs/utils/hooks/services. Only create new code if nothing suitable exists. Never rewrite working code without a clear technical reason.

# 8. Component Dependency Map
- **Frontend State**: Migrating from purely local `StoreContext.tsx` to React Query / Zustand for API syncing.
- **Backend Data Flow**: Request hits Express router -> Validated by Zod middleware -> Controller extracts params -> Service applies business logic -> Repository fetches/saves to Postgres via Prisma.

# 9. Admin Dashboard
- Complete CMS for Books, Categories, Authors, Publishers, Customers, Orders, Payments, Analytics, Homepage UI, Banners, and Media Library.

# 10. Customer Side
- Cart, Wishlist, Checkout, Orders, Search, Homepage, Product Details.

# 11. Security Review
- **SECURITY.md**: A dedicated `SECURITY.md` file has been created at the root of the project detailing the comprehensive, non-negotiable OWASP compliant security architecture required for this commercial application.
- **Auth**: JWT & roles middleware with HttpOnly secure cookies and Rate Limiting.
- **Input validation**: Strict Zod schemas on both frontend forms and backend routes.
- **Passwords**: bcrypt hashing, with lockout policies.

# 12. Current Project Status
- ✅ Frontend routing and layout (Static mock version).
- ✅ Phase 0 Architecture Design.
- ✅ Phase 1 Backend Setup (Express + Prisma + PostgreSQL initialized, 0 TS errors).
- 🔄 Phase 2 Authentication & Authorization (Next).

# 13. Execution Roadmap
- **Phase 0 → Architecture & Database Design** ✅
- **Phase 1 → Backend Setup** ✅
- **Phase 2 → Authentication & Authorization** ← NEXT
- **Phase 3 → Books Module (complete)**
- **Phase 4 → Categories**
- **Phase 5 → Authors**
- **Phase 6 → Publishers**
- **Phase 7 → Customers**
- **Phase 8 → Orders**
- **Phase 9 → Homepage CMS**
- **Phase 10 → Media Library**
- **Phase 11 → Import / Export**
- **Phase 12 → Razorpay**
- **Phase 13 → Analytics Dashboard**
- **Phase 14 → Settings**
- **Phase 15 → Testing, Security Audit, Performance Optimization**

# 14. AI Working Memory
- **Project Root**: `c:\Users\rodd\Desktop\Kimi_Agent_Build Book E‑Commerce Site\`
- **Frontend**: `app/` (React 19 + Vite + TailwindCSS)
- **Backend**: `server/` (Express.js + TypeScript + Prisma)
- **Key backend files**: `server/src/app.ts`, `server/src/server.ts`, `server/prisma/schema.prisma`
- **Middleware stack**: Helmet → CORS → Compression → JSON → Cookie Parser → Request ID → Rate Limiter → Routes → Error Handler
- **Coding conventions**: Layered architecture (Controller > Service > Repository). ESM with `.js` import extensions. Zod validation on all inputs.
- **Logging**: Winston structured JSON (`logs/error.log`, `logs/combined.log`). Console in dev.
- **Request tracing**: Every request gets a UUID via `X-Request-Id` header.
- **Current progress**: Phase 1 complete. Server compiles with zero errors. Prisma client generated for all 19 models.
- **Next step**: Phase 2 — Authentication & Authorization (JWT login, bcrypt passwords, RBAC middleware, admin login page).
- **Known issues**: npm audit shows 2 high vulnerabilities from multer@1.x (will upgrade to multer@2 when Express 5 compatibility is confirmed).
