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
*   **POS & Billing**: 
    *   Swiper-based category navigation.
    *   Real-time cart management.
    *   Tax & Discount calculations.
    *   PDF Invoice generation.
*   **Inventory Control**: Stock management with low-stock alerts and history tracking.
*   **HR & Payroll**:
    *   **Staff Management**: Full employee directory with verification status.
    *   **Attendance**: Monthly interactive grid marking system.
    *   **Salary**: Automated payroll generation and payment tracking.
*   **Business Intelligence**: Deep-dive analytics into revenue trends, product performance, and staff distribution.
*   **Real-time Alerts**: Socket.io driven notifications for critical business events.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand (Cart, Auth, UI)
- **Visuals**: Recharts (Analytics), Swiper.js (POS), Lucide React (Icons)
- **Communication**: Axios, Socket.io-client
- **UX**: Lenis (Smooth Scroll), Sonner (Toasts)

### Backend
- **Core**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod (Schema validation)
- **Security**: JWT (HttpOnly cookies), bcryptjs
- **Logging**: Pino + Pino-pretty
- **Real-time**: Socket.io

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- npm or yarn

### 2. Environment Setup

Create a `.env` file in the **backend** folder:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/bos_db"
JWT_SECRET="your_jwt_secret"
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
```

Create a `.env.local` file in the **frontend** folder:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"
```

### 3. Installation

**Backend:**
```bash
cd backend
npm install
npx prisma generate
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

## 📂 Project Structure

```text
BOS/
├── backend/
│   ├── prisma/             # Schema & Seed
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth & Role guards
│   │   ├── routes/         # API Endpoints
│   │   ├── services/       # Business logic
│   │   └── utils/          # Logger & Helpers
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js Routes (Dashboard & Super Admin)
│   │   ├── components/     # UI & Layout components
│   │   ├── lib/            # Axios & Socket config
│   │   ├── store/          # Zustand state management
│   │   └── types/          # TS Interfaces
```

---

## 🎨 Design System

BOS uses a custom **Pastel Rainbow** design system defined in `globals.css`. It maps specific business statuses to soft, premium colors:
- **Success/Paid**: `#caffbf` (Soft Green)
- **Danger/Absent**: `#ffadad` (Soft Red)
- **Primary/Action**: `#a0c4ff` (Soft Blue)
- **Pending/Warning**: `#ffd6a5` (Soft Orange)
- **Secondary**: `#bdb2ff` (Soft Purple)

---

## 📄 License
MIT License - Created with ❤️ by Antigravity
