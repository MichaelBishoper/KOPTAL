import type { TenantProductRow } from "@/structure/db";
import type { ProductDraft, ProductUnitType } from "@/structure/tenant-product";
import { fetchAuthSessionFromAPI } from "@/fetch/auth";
import {
  createTenantProductOnAPI,
  deleteTenantProductOnAPI,
  updateTenantProductOnAPI,
} from "@/fetch/tenant-products";

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

export function createEmptyProductDraft(
  tenantName = "",
  location = "",
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

  const primaryImage = product.image ?? "/product-placeholder.jpg";

  return {
    id: String(product.product_id),
    name: product.name,
    category: product.category ?? "",
    price: String(product.price ?? 0),
    unitType: product.unit_id === 1 ? "grams" : "pieces",
    tenantName: "",
    location: "",
    images: [
      primaryImage,
      primaryImage,
      primaryImage,
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
): Promise<TenantProductRow | null> {
  if (initialProduct?.product_id) {
    return updateTenantProductDraft(draft, initialProduct);
  }

  return createTenantProductDraft(draft);
}

export async function createTenantProductDraft(draft: ProductDraft): Promise<TenantProductRow | null> {
  const payload = buildTenantProductSavePayload(draft);

  // Ensure tenant-scoped product creation always carries tenant_id, even if token claims differ.
  const session = await fetchAuthSessionFromAPI();
  if (!payload.tenant_id && session.role === "tennant" && session.userId) {
    payload.tenant_id = session.userId;
  }

  return createTenantProductOnAPI(payload);
}

export async function updateTenantProductDraft(
  draft: ProductDraft,
  initialProduct: TenantProductRow,
): Promise<TenantProductRow | null> {
  const payload = buildTenantProductSavePayload(draft, initialProduct);
  return updateTenantProductOnAPI(initialProduct.product_id, payload);
}

export async function deleteTenantProductDraft(productId: number): Promise<boolean> {
  return deleteTenantProductOnAPI(productId);
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