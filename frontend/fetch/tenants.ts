import type { TenantRow } from "@/structure/db";

const BASE = process.env.NEXT_PUBLIC_MONOLITH_URL ?? "http://localhost:4000";

export async function fetchTenantsFromAPI(): Promise<TenantRow[]> {
  try {
    const res = await fetch(`${BASE}/api/tenants`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[fetch/tenants] fetchTenantsFromAPI failed:", err);
    return [];
  }
}

export async function fetchTenantByIdFromAPI(id: number): Promise<TenantRow | undefined> {
  try {
    const res = await fetch(`${BASE}/api/tenants/${id}`);
    if (!res.ok) return undefined;
    return await res.json();
  } catch (err) {
    console.error("[fetch/tenants] fetchTenantByIdFromAPI failed:", err);
    return undefined;
  }
}
