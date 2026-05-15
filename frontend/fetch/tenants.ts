import type { TenantRow } from "@/structure/db";

type PublicTenant = {
  tenant_id?: number;
  name?: string;
  email?: string;
  phone?: string;
  verified?: boolean;
  location?: string;
  image?: string;
  image_url?: string;
  created_at?: string;
};

function toTenantRow(raw: PublicTenant, index: number): TenantRow {
  const tenantId = Number(raw.tenant_id);
  const createdAt = typeof raw.created_at === "string" ? raw.created_at : "";

  return {
    tenant_id: Number.isFinite(tenantId) ? tenantId : index + 1,
    name: String(raw.name ?? `Tenant ${index + 1}`),
    email: String(raw.email ?? ""),
    phone: String(raw.phone ?? ""),
    verified: Boolean(raw.verified),
    location: typeof raw.location === "string" ? raw.location : undefined,
    image: typeof raw.image === "string"
      ? raw.image
      : typeof raw.image_url === "string"
        ? raw.image_url
        : undefined,
    password_hash: "",
    created_at: createdAt,
  };
}

export async function fetchTenantsFromAPI(): Promise<TenantRow[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch("/api/iam/public/tenants", {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const rows = (await res.json().catch(() => [])) as PublicTenant[];
    if (!Array.isArray(rows)) return [];

    return rows.map((row, index) => toTenantRow(row, index));
  } catch {
    return [];
  }
}
