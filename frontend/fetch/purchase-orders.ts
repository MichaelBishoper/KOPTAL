import type { PoLineItemRow, PurchaseOrderRow, TenantProductRow } from "@/structure/db";
import { fetchAuthSessionFromAPI } from "@/fetch/auth";
import { fetchTenantProductByIdFromAPI } from "@/fetch/tenant-products";
import { fetchTenantsFromAPI } from "@/fetch/tenants";
import { fetchCustomersFromAPI } from "@/fetch/customers";

type CreatePurchaseOrderPayload = {
  tenant_id: number;
  shipping_address: string;
  notes?: string;
};

type CreateLineItemPayload = {
  po_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
};

export type POItem = PoLineItemRow & {
  id: string;
  name: string;
  price: number;
  image: string;
  details: string;
  unitLabel: string;
};

export type PurchaseOrder = PurchaseOrderRow & {
  id: string;
  name: string;
  tenantName?: string;
  tenantImage?: string;
  tenantLocation?: string;
  customerName?: string;
  customerImage?: string;
  items: POItem[];
};

function toPurchaseOrderRow(raw: unknown): PurchaseOrderRow | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;

  const po_id = Number(row.po_id);
  const customer_id = Number(row.customer_id);
  const tenant_id = Number(row.tenant_id);
  const subtotal = Number(row.subtotal ?? 0);
  const tax_amount = Number(row.tax_amount ?? 0);
  const total_amount = Number(row.total_amount ?? 0);

  if (![po_id, customer_id, tenant_id].every(Number.isFinite)) return null;

  return {
    po_id,
    po_number: String(row.po_number ?? `PO-${po_id}`),
    customer_id,
    tenant_id,
    status: String(row.status ?? "Pending"),
    order_date: String(row.order_date ?? new Date().toISOString()),
    shipping_address: String(row.shipping_address ?? ""),
    notes: String(row.notes ?? ""),
    subtotal: Number.isFinite(subtotal) ? subtotal : 0,
    tax_amount: Number.isFinite(tax_amount) ? tax_amount : 0,
    total_amount: Number.isFinite(total_amount) ? total_amount : 0,
  };
}

function toLineItemRow(raw: unknown): PoLineItemRow | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;

  const po_item_id = Number(row.po_item_id);
  const po_id = Number(row.po_id);
  const product_id = Number(row.product_id);
  const quantity = Number(row.quantity);
  const unit_price = Number(row.unit_price);
  const subtotal = Number(row.subtotal ?? quantity * unit_price);

  if (![po_item_id, po_id, product_id, quantity, unit_price].every(Number.isFinite)) return null;

  return {
    po_item_id,
    po_id,
    product_id,
    quantity,
    unit_price,
    subtotal: Number.isFinite(subtotal) ? subtotal : quantity * unit_price,
  };
}

async function fetchOrderRowsFromAPI(): Promise<PurchaseOrderRow[]> {
  const session = await fetchAuthSessionFromAPI();

  if (session.role !== "customer" && session.role !== "tennant") {
    return [];
  }

  const endpoint = session.role === "customer"
    ? "/api/monolith/purchaseOrders/my-orders"
    : "/api/monolith/purchaseOrders/tenant-orders";

  try {
    const res = await fetch(endpoint, {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) return [];

    const rows = (await res.json().catch(() => [])) as unknown[];
    if (!Array.isArray(rows)) return [];

    return rows.map(toPurchaseOrderRow).filter((row): row is PurchaseOrderRow => Boolean(row));
  } catch {
    return [];
  }
}

async function fetchOrderItemsFromAPI(orderId: number): Promise<PoLineItemRow[]> {
  try {
    const res = await fetch(`/api/monolith/lineItems/order/${orderId}`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) return [];

    const rows = (await res.json().catch(() => [])) as unknown[];
    if (!Array.isArray(rows)) return [];

    return rows.map(toLineItemRow).filter((row): row is PoLineItemRow => Boolean(row));
  } catch {
    return [];
  }
}

function buildItemDetails(product: TenantProductRow | undefined, order: PurchaseOrderRow): string {
  const itemName = product?.name ?? `Product ${order.po_id}`;
  return `${itemName} • PO ${order.po_number}`;
}

export async function fetchPurchaseOrdersFromAPI(): Promise<PurchaseOrder[]> {
  const orders = await fetchOrderRowsFromAPI();
  const tenants = await fetchTenantsFromAPI();
  const customers = await fetchCustomersFromAPI();

  const mapped = await Promise.all(
    orders.map(async (order) => {
      const tenant = tenants.find((entry) => entry.tenant_id === order.tenant_id);
      const customer = customers.find((entry) => entry.customer_id === order.customer_id);
      const itemRows = await fetchOrderItemsFromAPI(order.po_id);

      const items = await Promise.all(
        itemRows.map(async (item) => {
          const product = await fetchTenantProductByIdFromAPI(item.product_id);
          return {
            ...item,
            id: `item-${item.po_item_id}`,
            name: product?.name ?? `Product ${item.product_id}`,
            price: item.unit_price,
            image: product?.image ?? "/product-placeholder.png",
            details: buildItemDetails(product, order),
            unitLabel: product?.unit_id === 1 ? "grams" : "pieces",
          } as POItem;
        })
      );

      return {
        ...order,
        id: `po-${order.po_id}`,
        name: `PO ${order.po_id}`,
        tenantName: tenant?.name,
        tenantImage: tenant?.image,
        tenantLocation: tenant?.location,
        customerName: customer?.name,
        customerImage: customer?.image_url ?? undefined,
        items,
      } as PurchaseOrder;
    })
  );

  return mapped;
}

export async function createPurchaseOrderOnAPI(
  payload: CreatePurchaseOrderPayload,
): Promise<PurchaseOrderRow | null> {
  try {
    const res = await fetch("/api/monolith/purchaseOrders", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;

    const row = (await res.json().catch(() => null)) as unknown;
    return toPurchaseOrderRow(row);
  } catch {
    return null;
  }
}

export async function createLineItemOnAPI(
  payload: CreateLineItemPayload,
): Promise<PoLineItemRow | null> {
  try {
    const res = await fetch("/api/monolith/lineItems", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;

    const row = (await res.json().catch(() => null)) as unknown;
    return toLineItemRow(row);
  } catch {
    return null;
  }
}

export async function updatePurchaseOrderStatusOnAPI(
  poId: number,
  status: string,
): Promise<PurchaseOrderRow | null> {
  const res = await fetch(`/api/monolith/purchaseOrders/${poId}/status`, {
    method: "PUT",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => null)) as { error?: string; message?: string } | null;
    const message = errorBody?.error ?? errorBody?.message ?? `Failed to update order status (${res.status})`;
    throw new Error(message);
  }

  const row = (await res.json().catch(() => null)) as unknown;
  return toPurchaseOrderRow(row);
}
