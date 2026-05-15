# 🗄️ Database Design

BOS uses a relational schema designed for **PostgreSQL**, managed via **Prisma ORM**. The schema is optimized for multi-tenancy and data integrity.

---

## 🗺️ Entity Relationship Overview

### 1. The Tenant (Company)
The `Company` model is the root of the ecosystem. Everything belongs to a company.
- **Fields**: `name`, `slug`, `plan` (BASIC/PRO/ENTERPRISE), `planExpiresAt`, `isSuspended`.
- **Relations**: One-to-many with Users, Staff, Products, Invoices, etc.

### 2. Users vs. Staff
- **Users**: People who can **login** to the system (Super Admins or Company Admins).
- **StaffMembers**: Employees of a company (e.g., Sales staff, Waiters). They **do not have login access** by default; they are records for attendance and payroll.

### 3. Sales & Inventory
- **Product**: Tracks `price` and `stockQty`. Has a `lowStockThreshold` for notifications.
- **Invoice**: The primary transaction record.
- **InvoiceItem**: Junction table for products in an invoice. **Logic**: When an invoice is created, stock is subtracted. When cancelled, stock is restored.

### 4. Human Resources
- **Attendance**: Unique per `staffId` and `date`. Statuses: `PRESENT`, `ABSENT`, `HALF_DAY`.
- **Salary**: Tracks monthly payroll for staff. Statuses: `PENDING`, `PAID`.

---

## 🔢 Core Models (Snippet)

```prisma
model Company {
  id            String    @id @default(cuid())
  slug          String    @unique
  plan          PlanType  @default(BASIC)
  // ... other fields
  staff         StaffMember[]
  products      Product[]
  invoices      Invoice[]
}

model Invoice {
  id              String        @id @default(cuid())
  invoiceNumber   String        @unique
  total           Float
  status          InvoiceStatus @default(PAID)
  items           InvoiceItem[]
}
```

---

## 🚀 Performance Optimizations
- **Compound Uniques**: `@@unique([staffId, date])` on Attendance ensures no duplicate markings for the same day.
- **Indexes**: Strategic indexing on `companyId` across all tables ensures that as the platform grows to thousands of tenants, query performance remains constant.
- **Soft Deletes**: Uses `deletedAt` field on critical entities like Products and Staff to preserve historical audit trails.
