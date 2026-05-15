# 📐 Platform Architecture & Process

This document explains the technical architecture and development process of the **BOS (Business Operating System)** platform.

---

## 🏗️ System Architecture

BOS is designed as a **Multi-Tenant SaaS** application with a unified backend and a role-aware frontend.

### 1. Multi-Tenancy Strategy
- **Isolation Level**: Schema-level isolation using a `companyId` (Tenant ID) on every resource.
- **Tenant Identification**: Users are linked to a `Company`. When a `COMPANY_ADMIN` logs in, all queries are automatically filtered by their `companyId` via backend middleware.
- **Super Admin Governance**: A special `SUPER_ADMIN` role that has cross-tenant visibility for platform management.

### 2. Frontend Flow (Next.js 15)
- **Role-Based Routing**:
    - `/super-admin/*`: Only accessible to `SUPER_ADMIN`.
    - `/dashboard/*`: Only accessible to `COMPANY_ADMIN`.
- **State Management**:
    - `auth.store.ts`: Manages user sessions, roles, and company context.
    - `cart.store.ts`: Handles real-time POS operations and tax calculations.
- **Real-time Integration**:
    - `Socket.io` client listens for global events (notifications, stock updates) to provide an "alive" UI experience.

### 3. Backend Workflow (Express + Prisma)
- **Middleware Chain**:
    1. `authMiddleware`: Validates JWT from HttpOnly cookies.
    2. `tenantMiddleware`: Injects `companyId` into the request object.
    3. `roleMiddleware`: Ensures the user has permission for the specific route.
- **Service Layer**: All business logic (e.g., "Cancel Invoice -> Restore Stock") is wrapped in Prisma transactions to ensure data integrity.

---

## 🛠️ Development Process

The project followed a modular "Phase-wise" development approach:

1.  **Core Foundation**: Setting up PostgreSQL, Prisma models, and Base Auth.
2.  **Tenant Onboarding**: Building the Super Admin flow to create companies.
3.  **Inventory & Sales**: Implementing the core POS engine and stock tracking.
4.  **Human Resources**: Adding Staff management, Attendance, and Payroll.
5.  **Analytics & Intelligence**: Aggregating data into visual charts using Recharts.
6.  **Real-time Polish**: Integrating Socket.io for notifications and live dashboard counters.

---

## 📈 Scalability Considerations
- **Indexing**: Database fields like `companyId`, `createdAt`, and `slug` are indexed for fast lookups.
- **Performance**: Heavy use of `Skeleton` loaders and optimistic UI updates to keep the interface snappy.
- **Extensibility**: The modular structure allows adding new modules (like "Expenses" or "CRM") by simply adding a new `[module]/page.tsx` and a corresponding backend service.
