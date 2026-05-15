import { getTaxRate } from "./admins";
import { fetchPurchaseOrdersFromAPI, type POItem, type PurchaseOrder } from "@/fetch/purchase-orders";

export type { POItem, PurchaseOrder };

let cachedPurchaseOrders: PurchaseOrder[] = [];

export function getPurchaseOrders(): PurchaseOrder[] {
  return [...cachedPurchaseOrders];
}

export let purchaseOrderRows = cachedPurchaseOrders.map((entry) => ({ ...entry }));

export async function loadPurchaseOrders(): Promise<PurchaseOrder[]> {
  const rows = await fetchPurchaseOrdersFromAPI();
  cachedPurchaseOrders = rows;
  purchaseOrderRows = rows.map((entry) => ({ ...entry }));
  return [...cachedPurchaseOrders];
}

export function getStatusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "delivered") return "bg-emerald-100 text-emerald-700";
  if (s === "cancelled") return "bg-rose-100 text-rose-700";
  if (s === "ontheway" || s === "shipped") return "bg-amber-100 text-amber-700";
  if (s === "pending" || s === "submitted" || s === "confirmed" || s === "draft") {
    return "bg-sky-100 text-sky-700";
  }
  return "bg-slate-100 text-slate-700";
}

export function getStatusLabel(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "ontheway" || normalized === "shipped") return "On the way";
  if (normalized === "pending" || normalized === "draft") return "Pending";
  if (normalized === "confirmed") return "Accepted";
  if (normalized === "submitted") return "Submitted";
  if (normalized === "delivered") return "Delivered";
  if (normalized === "cancelled") return "Cancelled";
  return status;
}

export function isAcceptedOrderStatus(status: string): boolean {
  const normalizedStatus = status.toLowerCase();
  return (
    normalizedStatus === "ontheway" ||
    normalizedStatus === "shipped" ||
    normalizedStatus === "confirmed" ||
    normalizedStatus === "delivered"
  );
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

