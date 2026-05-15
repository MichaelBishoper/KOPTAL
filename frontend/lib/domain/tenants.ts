import type { TenantRow } from "@/structure/db";
import { fetchTenantsFromAPI, fetchTenantByIdFromAPI } from "@/fetch/tenants";

// Module-level cache — populated by loadTenants().
// Sync accessors (getTenantById, getTenantByName) read from this cache.
let cache: TenantRow[] = [];

/** Fetch all tenants from the API and populate the module cache. */
export async function loadTenants(): Promise<TenantRow[]> {
  cache = await fetchTenantsFromAPI();
  return cache;
}

/** Returns all tenants from cache (call loadTenants() first). */
export function getTenants(): TenantRow[] {
  return cache;
}

export function getTenantById(tenantId?: number): TenantRow | undefined {
  if (tenantId == null) return undefined;
  return cache.find((tenant) => tenant.tenant_id === tenantId);
}

export function getTenantByName(name?: string): TenantRow | undefined {
  if (!name) return undefined;
  return cache.find((tenant) => tenant.name === name);
}
