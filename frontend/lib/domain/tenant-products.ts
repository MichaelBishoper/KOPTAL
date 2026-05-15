import type { TenantProductRow } from "@/structure/db";
import { fetchTenantProductByIdFromAPI, fetchTenantProductsFromAPI } from "@/fetch/tenant-products";
import { fetchTenantsFromAPI } from "@/fetch/tenants";
import { getTenantById, getTenantByName, getTenantProfileImage } from "./tenants";
import { getUnitById } from "./units";

let cachedTenantProducts: TenantProductRow[] = [];

export type TenantProductCard = {
  id: string;
  name: string;
  image: string;
  tenantName: string;
  location: string;
  price: number;
  quantity: number;
  unitLabel: string;
};

export type TenantProductDetails = TenantProductRow & {
  id: string;
  tenantName?: string;
  tenantImage?: string;
  location?: string;
  image?: string;
  images?: string[];
  description?: string;
  availability?: number;
};

export function getTenantProducts(): TenantProductRow[] {
  return [...cachedTenantProducts];
}

export async function loadTenantProducts(): Promise<TenantProductRow[]> {
  const rows = await fetchTenantProductsFromAPI();
  const tenants = await fetchTenantsFromAPI();
  cachedTenantProducts = rows.map((row) => {
    const tenant = tenants.find((entry) => entry.tenant_id === row.tenant_id);
    return Object.assign({}, row, {
      tenant_name: tenant?.name,
      tenant_image: tenant?.image,
      location: tenant?.location,
    }) as TenantProductRow;
  });
  return [...cachedTenantProducts];
}

function getAttachedTenantMeta(product: TenantProductRow): {
  tenantName?: string;
  tenantImage?: string;
  location?: string;
} {
  const record = product as Record<string, unknown>;
  return {
    tenantName: typeof record.tenant_name === "string" ? record.tenant_name : undefined,
    tenantImage: typeof record.tenant_image === "string" ? record.tenant_image : undefined,
    location: typeof record.location === "string" ? record.location : undefined,
  };
}

export function getTenantProductById(productId?: number | string): TenantProductRow | undefined {
  if (productId == null || productId === "") return undefined;
  const numericId = Number(productId);
  return cachedTenantProducts.find((product) => product.product_id === numericId || String(product.product_id) === String(productId));
}

export async function loadTenantProductById(productId?: number | string): Promise<TenantProductRow | undefined> {
  if (productId == null || productId === "") return undefined;
  const row = await fetchTenantProductByIdFromAPI(productId);

  if (!row) return undefined;

  const index = cachedTenantProducts.findIndex((entry) => entry.product_id === row.product_id);
  if (index >= 0) {
    cachedTenantProducts[index] = row;
  } else {
    cachedTenantProducts.push(row);
  }

  return row;
}

export function toCatalogCard(product: TenantProductRow): TenantProductCard {
  const tenant = getTenantById(product.tenant_id);
  const attached = getAttachedTenantMeta(product);
  const unit = getUnitById(product.unit_id);

  return {
    id: String(product.product_id),
    name: product.name,
    image: product.image ?? attached.tenantImage ?? getTenantProfileImage(tenant),
    tenantName: attached.tenantName ?? tenant?.name ?? "Unknown Tenant",
    location: attached.location ?? tenant?.location ?? "",
    price: product.price,
    quantity: product.quantity,
    unitLabel: unit?.unit_name ?? "Items",
  };
}

export function toProductDetails(product: TenantProductRow): TenantProductDetails {
  const tenant = getTenantById(product.tenant_id);
  const attached = getAttachedTenantMeta(product);

  return {
    ...product,
    id: String(product.product_id),
    tenantName: attached.tenantName ?? tenant?.name ?? "Unknown Tenant",
    tenantImage: attached.tenantImage ?? getTenantProfileImage(tenant),
    location: attached.location ?? tenant?.location ?? "",
    image: product.image ?? attached.tenantImage ?? getTenantProfileImage(tenant),
    images: product.image ? [product.image] : [attached.tenantImage ?? getTenantProfileImage(tenant)],
    description: product.description ?? "",
    availability: product.quantity,
  };
}

export function toTenantDashboardCard(product: TenantProductRow) {
  const tenant = getTenantById(product.tenant_id);
  const attached = getAttachedTenantMeta(product);
  return {
    id: String(product.product_id),
    name: product.name,
    image: product.image ?? attached.tenantImage ?? getTenantProfileImage(tenant),
    tenantName: attached.tenantName ?? tenant?.name ?? "Tenant",
  };
}

export function getProductTenantName(product: TenantProductRow): string {
  return getTenantByName(getTenantById(product.tenant_id)?.name)?.name ?? "Unknown Tenant";
}