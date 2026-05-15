import type { TenantProductRow } from "@/structure/db";
import { readAuthTokenFromCookies } from "@/lib/cookies/client";

const BASE = process.env.NEXT_PUBLIC_MONOLITH_URL ?? "http://localhost:4000";

type TenantProductUpsertPayload = {
  tenant_id?: number;
  unit_id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  description: string;
  image: string;
};

function getAuthHeaders(): Record<string, string> {
  const token = readAuthTokenFromCookies();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchTenantProductsFromAPI(): Promise<TenantProductRow[]> {
  try {
    const res = await fetch(`${BASE}/api/products`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // Monolith wraps responses in { success, data }.
    return Array.isArray(json) ? json : (json.data ?? []);
  } catch (err) {
    console.error("[fetch/tenant-products] fetchTenantProductsFromAPI failed:", err);
    return [];
  }
}

export async function fetchTenantProductByIdFromAPI(
  id: number,
): Promise<TenantProductRow | undefined> {
  try {
    const res = await fetch(`${BASE}/api/products/${id}`);
    if (!res.ok) return undefined;
    const json = await res.json();
    return json.data ?? json;
  } catch (err) {
    console.error("[fetch/tenant-products] fetchTenantProductByIdFromAPI failed:", err);
    return undefined;
  }
}

export async function createTenantProductOnAPI(payload: TenantProductUpsertPayload): Promise<TenantProductRow | undefined> {
  try {
    const res = await fetch(`${BASE}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data ?? json;
  } catch (err) {
    console.error("[fetch/tenant-products] createTenantProductOnAPI failed:", err);
    return undefined;
  }
}

export async function updateTenantProductOnAPI(
  id: number,
  payload: TenantProductUpsertPayload,
): Promise<TenantProductRow | undefined> {
  try {
    const res = await fetch(`${BASE}/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data ?? json;
  } catch (err) {
    console.error("[fetch/tenant-products] updateTenantProductOnAPI failed:", err);
    return undefined;
  }
}

export async function deleteTenantProductOnAPI(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/api/products/${id}`, {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(),
      },
    });
    return res.ok;
  } catch (err) {
    console.error("[fetch/tenant-products] deleteTenantProductOnAPI failed:", err);
    return false;
  }
}
