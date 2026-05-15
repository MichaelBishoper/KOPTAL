const BASE = process.env.NEXT_PUBLIC_MONOLITH_URL ?? "http://localhost:4000";

export async function fetchPurchaseOrdersFromAPI(customerId?: number): Promise<any[]> {
  try {
    const url = customerId
      ? `${BASE}/api/purchase-orders?customer_id=${customerId}`
      : `${BASE}/api/purchase-orders`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[fetch/purchase-orders] fetchPurchaseOrdersFromAPI failed:", err);
    return [];
  }
}

export async function fetchPurchaseOrderByIdFromAPI(id: number): Promise<any | undefined> {
  try {
    const res = await fetch(`${BASE}/api/purchase-orders/${id}`);
    if (!res.ok) return undefined;
    return await res.json();
  } catch (err) {
    console.error("[fetch/purchase-orders] fetchPurchaseOrderByIdFromAPI failed:", err);
    return undefined;
  }
}
