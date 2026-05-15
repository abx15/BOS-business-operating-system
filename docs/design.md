# 🎨 Design System: Pastel Rainbow

BOS features a unique, premium design system dubbed **"Pastel Rainbow"**. This system balances professional SaaS utility with a modern, vibrant aesthetic.

---

## 🌈 Color Palette

The platform uses a carefully curated set of pastel colors to signify business states, ensuring they are distinct but easy on the eyes in a dark-themed environment.

| State | Color | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Success** | Pastel Green | `#caffbf` | Paid Invoices, Present Attendance, Verified Staff |
| **Danger** | Pastel Red | `#ffadad` | Cancelled Invoices, Absent Attendance, Low Stock |
| **Primary** | Pastel Blue | `#a0c4ff` | Primary Buttons, Active Sidebar Icons, Dashboard Stats |
| **Warning** | Pastel Orange | `#ffd6a5` | Pending Salaries, Expired Plans, Half-day Attendance |
| **Secondary**| Pastel Purple | `#bdb2ff` | Enterprise Plans, Analytics Legend, Special Badges |

---

## 🧱 UI/UX Principles

### 1. Glassmorphism & Depth
- **Sidebar**: A deep dark sidebar (`#0a0a0a`) contrasted with vibrant icons.
- **Cards**: Subtle borders with low opacity backgrounds to create a layered "glass" effect.
- **Transitions**: Smooth hover effects on all interactive elements (Cards, Buttons, Nav links).

### 2. Information Hierarchy
- **Typography**: Modern sans-serif stack (Inter/System Default) with bold weights for numbers and currency.
- **Spacing**: Generous padding (`p-6`) and rounded corners (`rounded-xl` / `24px`) to make the interface feel approachable and non-corporate.
- **Empty States**: Custom illustrations and action-oriented descriptions for every empty module.

### 3. Interactive Feedback
- **Micro-animations**: Subtle scale-up on sidebar icons when hovered.
- **Real-time UI**: Notifications slide in smoothly via `sonner`, and dashboard stats pulse when updated via Socket.io.
- **Skeleton Loaders**: Every data-heavy page uses custom skeletons that match the exact layout, reducing perceived latency.

---

## 🛠️ Implementation Details
The design system is managed globally via `globals.css` using CSS variables:
```css
:root {
  --pastel-success: #caffbf;
  --pastel-danger: #ffadad;
  --pastel-primary: #a0c4ff;
  /* ... */
}
```
Components in `shadcn/ui` have been customized to utilize these tokens instead of standard brand colors.
