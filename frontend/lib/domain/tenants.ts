import type { TenantRow } from "@/structure/db";
import { fetchTenantsFromAPI } from "@/fetch/tenants";

let cachedTenants: TenantRow[] = [];

export function getTenants(): TenantRow[] {
  return [...cachedTenants];
}

export async function loadTenants(): Promise<TenantRow[]> {
  const rows = await fetchTenantsFromAPI();
  if (rows.length > 0 || cachedTenants.length === 0) {
    cachedTenants = rows;
  }
  return [...cachedTenants];
}

export function getTenantById(tenantId?: number): TenantRow | undefined {
  if (tenantId == null) return undefined;
  return cachedTenants.find((tenant) => tenant.tenant_id === tenantId);
}

export function getTenantByName(name?: string): TenantRow | undefined {
  if (!name) return undefined;
  return cachedTenants.find((tenant) => tenant.name === name);
}