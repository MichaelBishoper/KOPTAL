import type { TenantRow } from "@/structure/db";
import { fetchTenantsFromAPI } from "@/fetch/tenants";

let cachedTenants: TenantRow[] = [];
const TENANT_IMAGE_FALLBACK = "/product-placeholder.png";

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

export function getTenantProfileImage(tenant?: Pick<TenantRow, "image"> | null): string {
  const image = typeof tenant?.image === "string" ? tenant.image.trim() : "";
  return image || TENANT_IMAGE_FALLBACK;
}

export function shouldUseNativeImage(src?: string | null): boolean {
  const value = typeof src === "string" ? src.trim() : "";
  if (!value) return false;

  return (
    value.startsWith("blob:") ||
    value.startsWith("data:") ||
    value.startsWith("http://localhost:3002/") ||
    value.startsWith("http://127.0.0.1:3002/") ||
    value.startsWith("http://localhost:3000/") ||
    value.startsWith("http://127.0.0.1:3000/")
  );
}

export function safeImageSrc(src?: string | null): string {
  const value = typeof src === "string" ? src.trim() : "";
  if (!value) return TENANT_IMAGE_FALLBACK;
  return value;
}

export function upsertTenantCache(tenant: TenantRow): void {
  const index = cachedTenants.findIndex((entry) => entry.tenant_id === tenant.tenant_id);
  if (index >= 0) {
    cachedTenants[index] = tenant;
    return;
  }

  cachedTenants.push(tenant);
}