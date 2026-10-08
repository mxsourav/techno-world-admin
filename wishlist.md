# Wishlist and Future Architectural Roadmap

## Sub-Admin Role-Based Access Control (RBAC) Specification

This document details the planned sub-admin hierarchy, data isolation rules, and permission enforcement model for future implementation across the Techno World Books platform.

---

### 1. Architectural Philosophy and Security Boundaries

To maintain platform security, prevent unauthorized data exfiltration, and ensure the principle of least privilege, administrator functions are categorized into distinct operational roles.

1. **Least Privilege Enforcement**: Sub-admins only access the exact panels and API routes required for their immediate responsibilities.
2. **Financial Isolation**: Operational staff (Orders, Support, Content) never have access to payment gateway keys, bank account settlement details, or aggregate sales turnover reports.
3. **Customer PII Safeguards**: Customer records are protected from bulk exfiltration. Support staff cannot browse or dump the complete customer directory; lookups are restricted to targeted queries initiated by user requests.

---

### 2. Role Definitions and Capability Matrix

#### A. Super Admin (Owner / System Administrator)
* **Scope**: Universal platform access without restrictions.
* **Capabilities**:
  * Full access to all dashboards, analytics, and operational tabs.
  * Payment gateway setup (Razorpay keys, webhook secrets, bank settlement accounts).
  * Financial reporting (Sales & Revenue Report, gross profit margins, revenue graphs).
  * System security (Admin profile credentials, password changes, active device session limiting, revoking active sessions).
  * Sub-admin account provisioning, role assignment, and access revocation.
  * System SMTP and Outbound Email configuration.

#### B. Order Operations Admin (Fulfillment & Logistics)
* **Scope**: Order processing, packing, shipping, and abandoned cart recovery.
* **Allowed Panels**:
  * **Orders & Shipments**: View incoming orders, update dispatch statuses (PROCESSING, SHIPPED, DELIVERED), print packing slips and shipping stickers.
  * **Abandoned Carts**: Inspect incomplete customer checkouts and trigger recovery reminders.
  * **B2B Quotes**: Review bulk institutional quotation inquiries and respond with customized quotes.
* **Prohibited Areas**:
  * Payments & Gateway tab (hidden).
  * Sales & Revenue reports (hidden).
  * Admin Security & Credentials tab (hidden).
  * System SMTP credentials (hidden).

#### C. Support Desk Admin (Customer Care & Resolution)
* **Scope**: Customer inquiry resolution, ticket escalation, and communication.
* **Allowed Panels**:
  * **Support Desk**: View and reply to open tickets across Support and Team departments.
  * **Targeted Customer Lookup**: Search single customer records by exact phone number, email address, or order number provided by the customer during a support call or chat. Bulk listings, indiscriminate pagination, and CSV exports are strictly disabled.
  * **Sent Emails & Outbox Center**: Track customer order dispatch status and outbound notification delivery.
* **Prohibited Areas**:
  * Full Customer Directory bulk browse/export (hidden).
  * Financials, revenue summaries, and payment gateway configuration (hidden).
  * Admin account credentials and session security settings (hidden).
  * Product inventory manipulation and pricing adjustments (hidden).

#### D. Catalog & Merchandising Admin (Content & Marketing)
* **Scope**: Inventory cataloging, store aesthetics, discounts, and public content.
* **Allowed Panels**:
  * **Products & Books**: Add/edit books, manage categories, adjust stock inventory, configure Cloudinary image galleries.
  * **Coupons & Promos**: Create discount codes, percentage cuts, minimum purchase thresholds, and expiry dates.
  * **Media Library**: Manage Cloudinary uploads and product assets.
  * **Homepage CMS**: Configure banners, featured carousels, and seasonal collections.
  * **Blog & Social Feed**: Publish news articles, reading guides, and social updates.
  * **Reviews & Feedback**: Moderate product ratings, approve verified buyer reviews, and answer book questions.
* **Prohibited Areas**:
  * Orders and shipment handling (hidden).
  * Customer PII and full directory (hidden).
  * Payments, gateways, and revenue reports (hidden).
  * Admin security and server configuration (hidden).

---

### 3. Database Schema Blueprint (Prisma)

```prisma
enum AdminRole {
  SUPER_ADMIN
  ORDER_ADMIN
  SUPPORT_ADMIN
  CATALOG_ADMIN
}

enum AdminStatus {
  ACTIVE
  SUSPENDED
}

model AdminStaff {
  id               String         @id @default(uuid())
  email            String         @unique
  name             String
  phone            String?
  passwordHash     String
  role             AdminRole      @default(SUPPORT_ADMIN)
  status           AdminStatus    @default(ACTIVE)
  permissions      String[]       // Optional granular permissions override
  maxActiveDevices  Int            @default(2)
  sessions         AdminSession[]
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  @@index([email])
  @@index([role])
}
```

---

### 4. Backend Route Protection & Data Filtering Middleware

1. **Role Guard Middleware**:
   ```typescript
   export const requireRole = (...allowedRoles: AdminRole[]) => {
     return (req: Request, res: Response, next: NextFunction) => {
       if (!req.adminUser || !allowedRoles.includes(req.adminUser.role)) {
         return res.status(403).json({
           success: false,
           message: 'Access forbidden: Insufficient administrative privileges.'
         });
       }
       next();
     };
   };
   ```

2. **Scoped Customer Lookup Guard (Support Role)**:
   ```typescript
   // Support staff cannot call GET /api/v1/admin/customers without specific identifier
   export const searchCustomerForSupport = async (req: Request, res: Response) => {
     const { phone, email, orderNumber } = req.query;

     if (!phone && !email && !orderNumber) {
       return res.status(400).json({
         success: false,
         message: 'Direct identifier (phone, email, or order number) required for customer lookup.'
       });
     }

     const customer = await findCustomerByIdentifier({ phone, email, orderNumber });
     return res.json({ success: true, customer });
   };
   ```

---

### 5. Frontend Dynamic Navigation Filtering

In `src/components/admin/AdminLayout.tsx`:
```typescript
const filterSectionsByRole = (sections: TabSection[], role: AdminRole): TabSection[] => {
  if (role === 'SUPER_ADMIN') return sections;

  return sections
    .map(section => ({
      ...section,
      tabs: section.tabs.filter(tab => isTabAllowedForRole(tab.id, role))
    }))
    .filter(section => section.tabs.length > 0);
};
```

This ensures unassigned tabs never render in the DOM for restricted sub-admin accounts.
