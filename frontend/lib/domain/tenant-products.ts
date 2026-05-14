import { tenantProducts } from "@/data/tenant-products";
import type { TenantProductRow } from "@/structure/db";
import { getTenantById, getTenantByName } from "./tenants";
import { getUnitById } from "./units";

// Replace the `tenantProducts` import with `fetch('/api/tenant-products')` when backend data is ready.
// Keep the mapping helpers here so components stay stable.

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
  return tenantProducts;
}

export function getTenantProductById(productId?: number | string): TenantProductRow | undefined {
  if (productId == null || productId === "") return undefined;
  const numericId = Number(productId);
  return tenantProducts.find((product) => product.product_id === numericId || String(product.product_id) === String(productId));
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