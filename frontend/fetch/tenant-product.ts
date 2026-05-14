import type { TenantProductRow } from "@/structure/db";
import { getTenantProductById } from "@/lib";

// Replace this local lookup with `fetch('/api/tenant-products/:id')` when the backend is ready.

// Returns the raw DB-shaped tenant product row (matches `tenant_products` table schema).
export async function getTenantProductRowById(id?: string): Promise<TenantProductRow | undefined> {
  return getTenantProductById(id);
}

// Backwards-compatible alias used by pages that expect an editor value; returns the DB row.
export async function getTenantProductForEditor(id?: string): Promise<TenantProductRow | undefined> {
  return getTenantProductRowById(id);
}
