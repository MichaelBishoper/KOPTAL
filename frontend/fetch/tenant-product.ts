import type { TenantProductRow } from "@/structure/db";
import { fetchTenantProductByIdFromAPI } from "@/fetch/tenant-products";

export async function getTenantProductRowById(id?: string): Promise<TenantProductRow | undefined> {
  if (!id) return undefined;
  return fetchTenantProductByIdFromAPI(id);
}

export async function getTenantProductForEditor(id?: string): Promise<TenantProductRow | undefined> {
  return getTenantProductRowById(id);
}
