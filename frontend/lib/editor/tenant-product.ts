import type { TenantProductRow } from "@/structure/db";
import type { ProductDraft, ProductUnitType } from "@/structure/tenant-product";

// API migration scaffold (tenant products CRUD):
// 1) READ list/item: use GET `/api/tenant-products` and GET `/api/tenant-products/:id` in domain/fetch layer.
// 2) CREATE: replace `createTenantProductDraft` body with POST `/api/tenant-products`.
// 3) UPDATE: replace `updateTenantProductDraft` body with PUT/PATCH `/api/tenant-products/:id`.
// 4) DELETE: replace `deleteTenantProductDraft` body with DELETE `/api/tenant-products/:id`.
// 5) Keep payload builder/helpers so component contract remains stable.

export type TenantProductSavePayload = {
  product_id?: number;
  tenant_id?: number;
  unit_id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  description: string;
  image: string;
  location: string;
  unitType: ProductUnitType;
};

// POST: frontend will call an API route like `/api/tenant-products`.
// PUT/PATCH: frontend will call an API route like `/api/tenant-products/:id`.
// DELETE: frontend will call an API route like `/api/tenant-products/:id`.
// Backend team can keep DAO code inside the API handler, controller, or service layer.

export function createEmptyProductDraft(
  tenantName = "Your Store",
  location = "West Java",
): ProductDraft {
  return {
    id: "new-product",
    name: "",
    category: "",
    price: "",
    unitType: "pieces",
    tenantName,
    location,
    images: [
      "/product-placeholder.jpg",
      "/product-placeholder.jpg",
      "/product-placeholder.jpg",
    ],
    description: "",
    availability: "0",
  };
}

export function createProductDraftFromRow(product?: TenantProductRow): ProductDraft {
  if (!product) return createEmptyProductDraft();

  return {
    id: String(product.product_id),
    name: product.name,
    category: product.category ?? "",
    price: String(product.price ?? 0),
    unitType: product.unit_id === 1 ? "grams" : "pieces",
    tenantName: "",
    location: "",
    images: [
      "/product-placeholder.jpg",
      "/product-placeholder.jpg",
      "/product-placeholder.jpg",
    ],
    description: product.description ?? "",
    availability: String(product.quantity ?? 0),
  };
}

export function buildTenantProductSavePayload(
  draft: ProductDraft,
  initialProduct?: TenantProductRow,
): TenantProductSavePayload {
  const unit_id = draft.unitType === "grams" ? 1 : 2;

  return {
    product_id: initialProduct?.product_id,
    tenant_id: initialProduct?.tenant_id,
    unit_id,
    name: draft.name.trim(),
    category: draft.category.trim(),
    quantity: Number(draft.availability || 0),
    price: Number(draft.price || 0),
    description: draft.description.trim(),
    image: draft.images[0] ?? "/product-placeholder.jpg",
    location: draft.location.trim(),
    unitType: draft.unitType,
  };
}

export async function saveTenantProductDraft(
  draft: ProductDraft,
  initialProduct?: TenantProductRow,
): Promise<TenantProductSavePayload> {
  // Backend people can swap this function body for a `fetch()` call to the API route.
  return buildTenantProductSavePayload(draft, initialProduct);
}

export async function createTenantProductDraft(draft: ProductDraft): Promise<TenantProductSavePayload> {
  // POST seam: backend will replace this with `fetch('/api/tenant-products', { method: 'POST' })`.
  return buildTenantProductSavePayload(draft);
}

export async function updateTenantProductDraft(
  draft: ProductDraft,
  initialProduct: TenantProductRow,
): Promise<TenantProductSavePayload> {
  // PUT/PATCH seam: backend will replace this with `fetch('/api/tenant-products/:id', { method: 'PUT' | 'PATCH' })`.
  return buildTenantProductSavePayload(draft, initialProduct);
}

export async function deleteTenantProductDraft(productId: number): Promise<{ product_id: number }> {
  // DELETE seam: backend will replace this with `fetch('/api/tenant-products/:id', { method: 'DELETE' })`.
  return { product_id: productId };
}

export function hasApprovedCategory(category: string): boolean {
  return category.trim().length > 0;
}

export function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        reject(new Error("Failed to read image file"));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}