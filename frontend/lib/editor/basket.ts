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
  product: TenantProductRow,
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
  };
}

export function getBasketItems(): BasketItem[] {
  return readBasketItems();
}

export function addBasketItem(product: TenantProductRow, quantity: number): BasketItem {
  const payload = buildBasketSavePayload(product, quantity);
  const currentItems = readBasketItems();
  const existingIndex = currentItems.findIndex((item) => item.product_id === payload.product_id);
  const nextItem: BasketItem = {
    ...payload,
    basket_item_id: String(payload.product_id),
    added_at: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    currentItems[existingIndex] = {
      ...currentItems[existingIndex],
      ...nextItem,
      quantity: currentItems[existingIndex].quantity + quantity,
      subtotal: Math.round(payload.price * (currentItems[existingIndex].quantity + quantity)),
    };
    writeBasketItems(currentItems);
    return currentItems[existingIndex];
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
  product: TenantProductRow,
  quantity: number,
): Promise<BasketSavePayload> {
  // POST seam: replace this with `fetch('/api/basket', { method: 'POST' })`.
  return addBasketItem(product, quantity);
}
