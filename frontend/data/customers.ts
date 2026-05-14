import type { CustomerRow } from "@/structure/db";

export const customers: CustomerRow[] = [
  {
    customer_id: 1,
    name: "Alya Putri",
    email: "alya@example.com",
    phone: "+62-811-2222-3333",
    company: "Koptal Retail",
    tax_id: "NPWP-001",
    billing_address: "Jakarta",
    shipping_address: "Jakarta",
    password_hash: "",
    created_at: "2026-01-01T00:00:00.000Z",
  },
];
