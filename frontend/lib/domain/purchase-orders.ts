import { getTaxRate } from "./admins";
import type { PoLineItemRow, PurchaseOrderRow } from "@/structure/db";
import { fetchPurchaseOrdersFromAPI } from "@/fetch/purchase-orders";

// Types previously in @/data/purchase-orders — kept here so callers don't change.
export type POItem = PoLineItemRow & {
  id: string;
  name: string;
  price: number;
  image: string;
  details: string;
  unitLabel: string;
};

export type PurchaseOrder = PurchaseOrderRow & {
  id: string;
  name: string;
  items: POItem[];
};

// Module-level cache — populated by loadPurchaseOrders().
let cache: PurchaseOrder[] = [];
export let purchaseOrderRows: PurchaseOrderRow[] = [];

/** Fetch all purchase orders from the API and populate the module cache. */
export async function loadPurchaseOrders(customerId?: number): Promise<PurchaseOrder[]> {
  const data = await fetchPurchaseOrdersFromAPI(customerId);
  cache = data as PurchaseOrder[];
  purchaseOrderRows = data as PurchaseOrderRow[];
  return cache;
}

/** Returns cached purchase orders (call loadPurchaseOrders() first). */
export function getPurchaseOrders(): PurchaseOrder[] {
  return cache;
}

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

