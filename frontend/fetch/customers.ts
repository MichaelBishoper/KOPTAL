import type { CustomerRow } from "@/structure/db";

type PublicCustomer = {
  customer_id?: number;
  name?: string;
  company?: string;
};

function toCustomerRow(raw: PublicCustomer, index: number): CustomerRow {
  const customerId = Number(raw.customer_id);

  return {
    customer_id: Number.isFinite(customerId) ? customerId : index + 1,
    name: String(raw.name ?? `Customer ${index + 1}`),
    email: "",
    phone: "",
    company: String(raw.company ?? ""),
    tax_id: "",
    billing_address: "",
    shipping_address: "",
    password_hash: "",
    created_at: new Date().toISOString(),
  };
}

export async function fetchCustomersFromAPI(): Promise<CustomerRow[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch("/api/iam/public/customers", {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const rows = (await res.json().catch(() => [])) as PublicCustomer[];
    if (!Array.isArray(rows)) return [];

    return rows.map((row, index) => toCustomerRow(row, index));
  } catch {
    return [];
  }
}
