import { format, formatDistanceToNow } from "date-fns";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy, hh:mm a");
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  return format(new Date(Number(year), Number(m) - 1), "MMMM yyyy");
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CARD: "Card",
};

export const PASTEL_COLORS = {
  red:    "#ffadad",
  orange: "#ffd6a5",
  yellow: "#fdffb6",
  green:  "#caffbf",
  cyan:   "#9bf6ff",
  blue:   "#a0c4ff",
  purple: "#bdb2ff",
  pink:   "#ffc6ff",
};

// Recharts colors — pastel rainbow order
export const CHART_COLORS = [
  "#a0c4ff", // blue
  "#caffbf", // green
  "#bdb2ff", // purple
  "#ffadad", // red
  "#ffd6a5", // orange
  "#9bf6ff", // cyan
  "#ffc6ff", // pink
  "#fdffb6", // yellow
];
