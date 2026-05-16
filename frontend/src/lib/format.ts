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

export const BOS_COLORS = {
  navy:    "#00202e",
  blue:    "#003f5c",
  steel:   "#2c4875",
  purple:  "#8a508f",
  magenta: "#bc5090",
  coral:   "#ff6361",
  orange:  "#ff8531",
  gold:    "#ffa600",
  cream:   "#ffd380",
};

// Recharts colors — pastel rainbow order
export const CHART_COLORS = [
  "#bc5090", // primary/magenta
  "#ff6361", // coral
  "#8a508f", // purple
  "#ffa600", // gold
  "#2c4875", // steel
  "#ff8531", // orange
  "#003f5c", // blue
  "#ffd380", // cream
];
