import type { CustomerRow } from "@/structure/db";
import api from "@/lib/axios";

type PublicCustomer = {
  customer_id?: number;
  name?: string;
  company?: string;
  image_url?: string;
};

function toCustomerRow(raw: PublicCustomer, index: number): CustomerRow {
  const customerId = Number(raw.customer_id);

  return {
    customer_id: Number.isFinite(customerId) ? customerId : index + 1,
    name: String(raw.name ?? `Customer ${index + 1}`),
    email: "",
    phone: "",
    company: String(raw.company ?? ""),
    business_id_number: "",
    corporate_tax_id: "",
    billing_address: "",
    shipping_address: "",
    password_hash: "",
    image_url: typeof raw.image_url === "string" ? raw.image_url : undefined,
    created_at: new Date().toISOString(),
  };
}

export async function fetchCustomersFromAPI(): Promise<CustomerRow[]> {
  try {
    const res = await api.get<PublicCustomer[]>("/api/iam/public/customers", {
      timeout: 3500,
    });

    const rows = res.data;
    if (!Array.isArray(rows)) return [];

    return rows.map((row, index) => toCustomerRow(row, index));
  } catch {
    return [];
  }
}
