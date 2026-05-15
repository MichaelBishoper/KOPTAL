import type { TenantProductRow } from "@/structure/db";
import { fetchTenantProductByIdFromAPI, fetchTenantProductsFromAPI } from "@/fetch/tenant-products";
import { getTenantById, getTenantByName } from "./tenants";
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
  cachedTenantProducts = rows;
  return [...cachedTenantProducts];
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
  const unit = getUnitById(product.unit_id);

  return {
    id: String(product.product_id),
    name: product.name,
    image: product.image ?? tenant?.image ?? "/product-placeholder.jpg",
    tenantName: tenant?.name ?? "Unknown Tenant",
    location: tenant?.location ?? "",
    price: product.price,
    quantity: product.quantity,
    unitLabel: unit?.unit_name ?? "Items",
  };
}

export function toProductDetails(product: TenantProductRow): TenantProductDetails {
  const tenant = getTenantById(product.tenant_id);

  return {
    ...product,
    id: String(product.product_id),
    tenantName: tenant?.name ?? "Unknown Tenant",
    location: tenant?.location ?? "",
    image: product.image ?? tenant?.image ?? "/product-placeholder.jpg",
    images: product.image ? [product.image] : [tenant?.image ?? "/product-placeholder.jpg"],
    description: product.description ?? "",
    availability: product.quantity,
  };
}

export function toTenantDashboardCard(product: TenantProductRow) {
  const tenant = getTenantById(product.tenant_id);
  return {
    id: String(product.product_id),
    name: product.name,
    image: product.image ?? tenant?.image ?? "/product-placeholder.jpg",
    tenantName: tenant?.name ?? "Tenant",
  };
}

export function getProductTenantName(product: TenantProductRow): string {
  return getTenantByName(getTenantById(product.tenant_id)?.name)?.name ?? "Unknown Tenant";
}