import type { TenantProductRow } from "@/structure/db";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
};

const MONOLITH_BASE =
  typeof window === "undefined"
    ? `${process.env.INVENTORY_URL ?? process.env.MONOLITH_URL ?? "http://localhost:4001"}/api`
    : "/api/monolith";

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
    const res = await fetch(`${MONOLITH_BASE}/products`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) return [];
    const json = (await res.json()) as ApiEnvelope<unknown[]>;
    const rows = Array.isArray(json.data) ? json.data : [];
    return rows.map(toProductRow).filter((row): row is TenantProductRow => Boolean(row));
  } catch {
    return [];
  }
}

export async function fetchTenantProductByIdFromAPI(productId: number | string): Promise<TenantProductRow | undefined> {
  const numericId = Number(productId);
  if (!Number.isFinite(numericId)) return undefined;

  try {
    const res = await fetch(`${MONOLITH_BASE}/products/${numericId}`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) return undefined;
    const json = (await res.json()) as ApiEnvelope<unknown>;
    return toProductRow(json.data) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function createTenantProductOnAPI(payload: Partial<TenantProductRow>): Promise<TenantProductRow | null> {
  try {
    const res = await fetch(`${MONOLITH_BASE}/products`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;
    const json = (await res.json()) as ApiEnvelope<unknown>;
    return toProductRow(json.data);
  } catch {
    return null;
  }
}

export async function updateTenantProductOnAPI(
  productId: number,
  payload: Partial<TenantProductRow>,
): Promise<TenantProductRow | null> {
  try {
    const res = await fetch(`${MONOLITH_BASE}/products/${productId}`, {
      method: "PUT",
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;
    const json = (await res.json()) as ApiEnvelope<unknown>;
    return toProductRow(json.data);
  } catch {
    return null;
  }
}

export async function deleteTenantProductOnAPI(productId: number): Promise<boolean> {
  try {
    const res = await fetch(`${MONOLITH_BASE}/products/${productId}`, {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}
