# Production Security Requirements

This document outlines the mandatory security architecture, protocols, and best practices for the Techno World Books E-Commerce Platform. This is a commercial application, and security, reliability, maintainability, and scalability are non-negotiable.

All features must follow the **OWASP Top 10**, **OWASP ASVS**, **Principle of Least Privilege**, **Defense in Depth**, **Zero Trust mindset**, and **Secure by Default** methodologies.

## 1. Security Architecture
The platform utilizes a layered backend architecture:
`Route → Controller → Service → Repository → Prisma → Database`
Business logic must never reside in the controller, ensuring strict separation of concerns. All requests are considered malicious until explicitly validated at the Route/Controller layer via Zod schemas.

## 2. Authentication Flow
- **Passwords**: Hashed exclusively using `bcrypt`. Plain text passwords are strictly forbidden.
- **Tokens**: Short-lived JWT Access Tokens combined with Secure Refresh Tokens.
- **Cookies**: Tokens must be stored using `HttpOnly`, `Secure`, and `SameSite` flags to prevent XSS exfiltration.
- **Security Features**:
  - Secure logout and session invalidation.
  - Password complexity validation.
  - Account lockout after repeated failed login attempts.
  - Password reset architecture using secure, expiring tokens.

## 3. Authorization Model (RBAC)
- **Roles**: Super Admin, Admin, Content Manager, Order Manager.
- **Verification**: Every API endpoint must explicitly verify authorization server-side. Frontend role checks are for UI/UX purposes only and are never trusted.

## 4. API Protection
- **Validation**: Headers, Body, Params, and Queries are strictly validated using Zod. Invalid requests are rejected with proper HTTP status codes.
- **Rate Limiting**: Applied across all API routes, with stricter limits on authentication endpoints to prevent brute-force attacks.
- **HTTP Security**:
  - `Helmet` for secure HTTP headers.
  - Strict `CORS` configuration.
  - `X-Frame-Options`, `Content Security Policy` (CSP), `Referrer Policy`, `Permissions Policy`, and `HSTS`.
- **Error Handling**: Centralized error handling. Stack traces, database errors, internal paths, and environment variables are never exposed in production.

## 5. File Upload Rules
- **Validation**: Strict validation of File Type, Size, Mime Type, and Extension.
- **Executables**: Executable files are explicitly rejected.
- **Filenames**: Uploaded files are renamed using cryptographically secure random identifiers (e.g., UUIDs). Client-provided filenames are never trusted.

## 6. Environment Variables
- Secrets (`JWT Secret`, `Database Password`, `Razorpay Keys`, `SMTP Credentials`) are never committed to version control.
- Managed strictly via `.env` files and validated upon server startup.

## 7. Audit Logging
- **Structured Logs**: Critical actions must be recorded, including Admin Login, Failed Login, Book CRUD operations, Order Updates, Settings Changes, and Database Imports/Exports.
- **Audit Details**: Logs must include Timestamp, User ID, IP Address, Action, and Status.
- **Redaction**: Passwords, tokens, payment details, and sensitive customer PII are strictly redacted from all logs.

## 8. CSRF & Injection Protection
- **CSRF**: State-changing endpoints are protected via CSRF tokens if session cookies are utilized.
- **SQL/NoSQL Injection**: Prisma ORM utilizes parameterized queries exclusively. Raw SQL concatenation is forbidden.
- **XSS**: Inputs are sanitized, and React automatically escapes output.
- **Other**: Protections against Command Injection, Prototype Pollution, and Path Traversal are enforced.

## 9. Payment & Import Security
- **Payments**: Razorpay signatures are explicitly verified server-side. Frontend payment success callbacks are never trusted.
- **Imports**: CSV, Excel, JSON, and SQL imports are strictly validated to reject malformed files, dangerous content, and handle duplicate primary keys gracefully.

## 10. Security Checklist for Deployment
- [ ] Ensure all environment variables are securely injected via Render dashboard.
- [ ] Verify `Helmet`, `CORS`, and Rate Limiting middlewares are active.
- [ ] Run automated security scans on NPM dependencies (`npm audit`).
- [ ] Ensure database requires SSL/TLS connections.
- [ ] Verify audit logging is capturing critical events.

## 11. Backup Strategy
- Daily PostgreSQL backups via `pg_dump` or hosting provider snapshots.
- Migration rollback via `prisma migrate rollback`.
- Seed scripts (`prisma/seed.ts`) for data restoration.
- Test restore procedures quarterly.

## 12. Incident Response
- Monitor `ActivityLog` table for suspicious patterns (repeated failed logins, bulk deletions, unusual IP addresses).
- Account lockout triggers automatically after 5+ consecutive failed login attempts.
- Immediate token revocation on suspected account compromise (delete all `Session` records for the user).
- All admin actions are audited with IP address, User Agent, and Timestamp in the `ActivityLog` table.

## 13. Request Tracing
- Every HTTP request receives a UUID via the `X-Request-Id` header (generated by `src/middlewares/requestId.ts`).
- The Request ID flows through: Logger → Controller → Service → Repository.
- All error logs include the Request ID for end-to-end production debugging.

*Before marking any feature complete, developers must verify that it is Secure, Production Ready, Scalable, Maintainable, Tested, and OWASP Compliant. If a faster implementation would reduce security, the more secure implementation must always be chosen.*
