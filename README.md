# 🌈 BOS - Business Operating System (Multi-Tenant SaaS)

**BOS** is a high-fidelity, production-grade Multi-Tenant SaaS platform designed for small-to-medium businesses to manage their sales, inventory, and human resources in one unified interface. Built with a stunning **Pastel Rainbow** aesthetic, it provides a premium user experience for both Platform Owners (Super Admins) and Business Owners (Company Admins).

---

## ✨ Key Features

### 👑 Super Admin Panel
*   **Platform Analytics**: High-level overview of total companies, active staff, and subscription health.
*   **Tenant Management**: Full CRUD for companies with automatic slug generation.
*   **Subscription Governance**: Manage plans (Basic, Pro, Enterprise) and track expiry dates.
*   **User Onboarding**: Generate initial admin credentials for new tenants.
*   **Compliance Controls**: Instant verify, suspend, or activate toggles for any tenant.

### 🏢 Company Admin Panel
*   **Dynamic Dashboard**: Real-time sales charts (Recharts), stats cards, and recent activity.
*   **POS & Billing**: Swiper-based category navigation, real-time cart, Tax & Discount logic, and PDF Invoice generation.
*   **Inventory Control**: Stock management with low-stock alerts and history tracking.
*   **HR & Payroll**: Staff directory, monthly interactive attendance, and automated payroll.
*   **Business Intelligence**: Deep-dive analytics into revenue, products, and staff trends.
*   **Real-time Alerts**: Socket.io driven notifications for critical events.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15+ (App Router), TypeScript, Tailwind CSS |
| **UI Components** | shadcn/ui, Recharts, Swiper.js, Lucide Icons |
| **State/Auth** | Zustand, JWT (HttpOnly Cookies) |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Real-time** | Socket.io |

---

## 📂 Documentation & Design

For deeper details on how the system works, please refer to the internal documentation:

- 🏗️ **[Platform Architecture](./docs/architecture.md)**: Logic, process, and multi-tenancy flow.
- 🗄️ **[Database Design](./docs/database.md)**: Prisma schema, relationships, and indexing.
- 🎨 **[Design System](./docs/design.md)**: The "Pastel Rainbow" UI/UX principles and color tokens.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### 2. Installation & Run

**Backend:**
```bash
cd backend
npm install
npx prisma db push
npm run seed  # Creates Super Admin: admin@bos.com / SuperAdmin@123
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🎨 Design Philosophy
BOS uses a custom **Pastel Rainbow** design system. It maps business statuses to soft, premium colors (Success: `#caffbf`, Danger: `#ffadad`, Primary: `#a0c4ff`) to make complex data management feel professional yet approachable.

---

## 📄 Maintainer & Developer
**Arun Kumar Bind**  
📩 **Email**: [arun.builds.tech@gmail.com](mailto:arun.builds.tech@gmail.com)  
👨‍💻 **Role**: Lead Developer & Maintainer  

Created with ❤️ by Arun Kumar Bind.

---
MIT License
