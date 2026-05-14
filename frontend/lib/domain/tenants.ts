import { tenants } from "@/data/tenants";
import type { TenantRow } from "@/structure/db";

// Replace the `tenants` import with `fetch('/api/tenants')` when backend data is ready.

export function getTenants(): TenantRow[] {
  return tenants;
}

export function getTenantById(tenantId?: number): TenantRow | undefined {
  if (tenantId == null) return undefined;
  return tenants.find((tenant) => tenant.tenant_id === tenantId);
}

export function getTenantByName(name?: string): TenantRow | undefined {
  if (!name) return undefined;
  return tenants.find((tenant) => tenant.name === name);
}