import type { TenantProductRow } from "@/structure/db";
import api from "@/lib/axios";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
};

const INVENTORY_BASE =
  typeof window === "undefined"
    ? `${process.env.INVENTORY_URL ?? "http://127.0.0.1:4001"}/api`
    : "/api/inventory";

function toProductRow(raw: unknown): TenantProductRow | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;

  const product_id = Number(row.product_id);
  const tenant_id = Number(row.tenant_id);
  const unit_id = Number(row.unit_id);
  const quantity = Number(row.quantity);
  const price = Number(row.price);

  if (![product_id, tenant_id, unit_id, quantity, price].every(Number.isFinite)) {
    return null;
  }

  return {
    product_id,
    tenant_id,
    unit_id,
    name: String(row.name ?? ""),
    category: String(row.category ?? ""),
    quantity,
    price,
    image:
      typeof row.image === "string"
        ? row.image
        : typeof row.image_url === "string"
          ? row.image_url
          : undefined,
    description: typeof row.description === "string" ? row.description : undefined,
  };
}

export async function fetchTenantProductsFromAPI(): Promise<TenantProductRow[]> {
  try {
    const res = await api.get<ApiEnvelope<unknown[]>>(`${INVENTORY_BASE}/products`);

    const rows = Array.isArray(res.data.data) ? res.data.data : [];
    return rows.map(toProductRow).filter((row): row is TenantProductRow => Boolean(row));
  } catch {
    return [];
  }
}

export async function fetchTenantProductByIdFromAPI(productId: number | string): Promise<TenantProductRow | undefined> {
  const numericId = Number(productId);
  if (!Number.isFinite(numericId)) return undefined;

  try {
    const res = await api.get<ApiEnvelope<unknown>>(`${INVENTORY_BASE}/products/${numericId}`);

    return toProductRow(res.data.data) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function createTenantProductOnAPI(payload: Partial<TenantProductRow>): Promise<TenantProductRow | null> {
  try {
    const res = await api.post<ApiEnvelope<unknown>>(`${INVENTORY_BASE}/products`, payload);

    return toProductRow(res.data.data);
  } catch {
    return null;
  }
}

export async function updateTenantProductOnAPI(
  productId: number,
  payload: Partial<TenantProductRow>,
): Promise<TenantProductRow | null> {
  try {
    const res = await api.put<ApiEnvelope<unknown>>(`${INVENTORY_BASE}/products/${productId}`, payload);

    return toProductRow(res.data.data);
  } catch {
    return null;
  }
}

export async function deleteTenantProductOnAPI(productId: number): Promise<boolean> {
  try {
    await api.delete(`${INVENTORY_BASE}/products/${productId}`);
    return true;
  } catch {
    return false;
  }
}
