// Replace this re-export with `fetch('/api/purchase-orders')` when the backend is ready.
// Keep the exported names the same so components do not need to change.
import { getTaxRate } from "./admins";
export { type POItem, type PurchaseOrder, getPurchaseOrders, purchaseOrderRows } from "@/data/purchase-orders";

export function getStatusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "delivered") return "bg-emerald-100 text-emerald-700";
  if (s === "cancelled") return "bg-rose-100 text-rose-700";
  if (s === "ontheway") return "bg-amber-100 text-amber-700";
  if (s === "pending") return "bg-sky-100 text-sky-700";
  return "bg-slate-100 text-slate-700";
}

export function getStatusLabel(status: string): string {
  if (status.toLowerCase() === "ontheway") return "On the way";
  if (status.toLowerCase() === "pending") return "Pending";
  return status;
}

export function isAcceptedOrderStatus(status: string): boolean {
  const normalizedStatus = status.toLowerCase();
  return normalizedStatus === "ontheway" || normalizedStatus === "delivered";
}

export function formatOrderDate(dateValue: string): string {
  return new Date(dateValue).toLocaleDateString("en-GB", { timeZone: "UTC" });
}

// Helper to calculate total with dynamic tax rate
export function calculateOrderTotal(subtotal: number): { tax: number; total: number } {
  const taxRate = getTaxRate();
  const tax = Math.round(subtotal * (taxRate / 100));
  return {
    tax,
    total: subtotal + tax,
  };
}

