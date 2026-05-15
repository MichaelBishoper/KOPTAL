import type { TenantProductRow } from "@/structure/db";

// API migration scaffold (basket CRUD):
// 1) READ: replace `getBasketItems` with GET `/api/basket`.
// 2) CREATE: replace `saveBasketItemDraft`/`addBasketItem` write path with POST `/api/basket`.
// 3) DELETE item: replace `removeBasketItem` with DELETE `/api/basket/:productId`.
// 4) DELETE by tenant/clear: use DELETE `/api/basket?tenantId=...` or dedicated endpoints.
// 5) Remove localStorage helpers once backend persistence is active.

export type BasketSavePayload = {
  product_id: number;
  tenant_id: number;
  unit_id: number;
  quantity: number;
  price: number;
  subtotal: number;
  image: string;
  name: string;
  tenant_name?: string;
  tenant_location?: string;
  tenant_image?: string;
};

export type BasketItem = BasketSavePayload & {
  basket_item_id: string;
  added_at: string;
};

const BASKET_STORAGE_KEY = "koptal-basket-items";

function canUseStorage() {
  return typeof window !== "undefined";
}

function readBasketItems(): BasketItem[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(BASKET_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as BasketItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeBasketItems(items: BasketItem[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(items));
}

export function buildBasketSavePayload(
  product: TenantProductRow & { tenantName?: string; location?: string; tenantImage?: string },
  quantity: number,
): BasketSavePayload {
  const subtotal = Math.round(product.price * quantity);

  return {
    product_id: product.product_id,
    tenant_id: product.tenant_id,
    unit_id: product.unit_id,
    quantity,
    price: product.price,
    subtotal,
    image: product.image ?? "/product-placeholder.jpg",
    name: product.name,
    tenant_name: product.tenantName,
    tenant_location: product.location,
    tenant_image: product.tenantImage,
  };
}

export function getBasketItems(): BasketItem[] {
  return readBasketItems();
}

export function addBasketItem(product: TenantProductRow, quantity: number): BasketItem {
  const availableStock = Number(product.quantity);
  if (!Number.isFinite(availableStock) || availableStock <= 0) {
    throw new Error("Product is out of stock");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  const payload = buildBasketSavePayload(product, quantity);
  const currentItems = readBasketItems();
  const existingIndex = currentItems.findIndex((item) => item.product_id === payload.product_id);
  const nextItem: BasketItem = {
    ...payload,
    basket_item_id: String(payload.product_id),
    added_at: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    const nextQuantity = currentItems[existingIndex].quantity + quantity;
    if (nextQuantity > availableStock) {
      throw new Error("Requested quantity exceeds available stock");
    }

    currentItems[existingIndex] = {
      ...currentItems[existingIndex],
      ...nextItem,
      quantity: nextQuantity,
      subtotal: Math.round(payload.price * nextQuantity),
    };
    writeBasketItems(currentItems);
    return currentItems[existingIndex];
  }

  if (quantity > availableStock) {
    throw new Error("Requested quantity exceeds available stock");
  }

  const updatedItems = [...currentItems, nextItem];
  writeBasketItems(updatedItems);
  return nextItem;
}

export function removeBasketItem(productId: number): BasketItem[] {
  const filteredItems = readBasketItems().filter((item) => item.product_id !== productId);
  writeBasketItems(filteredItems);
  return filteredItems;
}

export function removeBasketTenantItems(tenantId: number): BasketItem[] {
  const filteredItems = readBasketItems().filter((item) => item.tenant_id !== tenantId);
  writeBasketItems(filteredItems);
  return filteredItems;
}

export function clearBasketItems(): BasketItem[] {
  writeBasketItems([]);
  return [];
}

export async function saveBasketItemDraft(
  product: TenantProductRow & { tenantName?: string; location?: string; tenantImage?: string },
  quantity: number,
): Promise<BasketSavePayload> {
  // POST seam: replace this with `fetch('/api/basket', { method: 'POST' })`.
  return addBasketItem(product, quantity);
}
