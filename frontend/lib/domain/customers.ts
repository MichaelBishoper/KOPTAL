import type { CustomerRow } from "@/structure/db";
import { fetchCustomersFromAPI } from "@/fetch/customers";

let cachedCustomers: CustomerRow[] = [];

export function getCustomers(): CustomerRow[] {
  return [...cachedCustomers];
}

export async function loadCustomers(): Promise<CustomerRow[]> {
  const rows = await fetchCustomersFromAPI();
  if (rows.length > 0 || cachedCustomers.length === 0) {
    cachedCustomers = rows;
  }
  return [...cachedCustomers];
}

export function getCustomerShippingAddressById(customerId: number): string {
  return cachedCustomers.find((entry) => entry.customer_id === customerId)?.shipping_address ?? "";
}
