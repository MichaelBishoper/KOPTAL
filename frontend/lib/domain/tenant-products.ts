import type { TenantProductRow } from "@/structure/db";
import { getTenantById, getTenantByName } from "./tenants";
import { getUnitById } from "./units";
import { fetchTenantProductsFromAPI, fetchTenantProductByIdFromAPI } from "@/fetch/tenant-products";

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

// Module-level cache — populated by loadTenantProducts().
let cache: TenantProductRow[] = [];

/** Fetch all tenant products from the API and populate the module cache. */
export async function loadTenantProducts(): Promise<TenantProductRow[]> {
  cache = await fetchTenantProductsFromAPI();
  return cache;
}

/** Returns all tenant products from cache (call loadTenantProducts() first). */
export function getTenantProducts(): TenantProductRow[] {
  return cache;
}

export function getTenantProductById(productId?: number | string): TenantProductRow | undefined {
  if (productId == null || productId === "") return undefined;
  return cache.find(
    (product) =>
      product.product_id === Number(productId) ||
      String(product.product_id) === String(productId),
  );
}

/** Fetch a single product from the API (bypasses cache — use for product detail pages). */
export async function loadTenantProductById(
  productId?: number | string,
): Promise<TenantProductRow | undefined> {
  if (productId == null || productId === "") return undefined;
  return fetchTenantProductByIdFromAPI(Number(productId));
}

export function toCatalogCard(product: TenantProductRow): TenantProductCard {
  const tenant = getTenantById(product.tenant_id);
  const unit = getUnitById(product.unit_id);

  return {
    id: String(product.product_id),
    name: product.name,
    image: product.image ?? tenant?.image ?? "/product-placeholder.jpg",
    tenantName: tenant?.name ?? "Unknown Tenant",
    location: tenant?.location ?? "West Java",
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
    tenantName: tenant?.name ?? "Your Store",
    location: tenant?.location ?? "West Java",
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