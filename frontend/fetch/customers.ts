import type { CustomerRow } from "@/structure/db";

const BASE = process.env.NEXT_PUBLIC_MONOLITH_URL ?? "http://localhost:4000";

export async function fetchCustomersFromAPI(): Promise<Omit<CustomerRow, "password_hash">[]> {
  try {
    const res = await fetch(`${BASE}/api/customers`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[fetch/customers] fetchCustomersFromAPI failed:", err);
    return [];
  }
}

export async function fetchCustomerByIdFromAPI(
  id: number,
): Promise<Omit<CustomerRow, "password_hash"> | undefined> {
  try {
    const res = await fetch(`${BASE}/api/customers/${id}`);
    if (!res.ok) return undefined;
    return await res.json();
  } catch (err) {
    console.error("[fetch/customers] fetchCustomerByIdFromAPI failed:", err);
    return undefined;
  }
}
