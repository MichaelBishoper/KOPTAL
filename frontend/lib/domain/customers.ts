import type { CustomerRow } from "@/structure/db";
import { fetchCustomersFromAPI } from "@/fetch/customers";

// Module-level cache — populated by loadCustomers().
let cache: Omit<CustomerRow, "password_hash">[] = [];

/** Fetch all customers from the API and populate the module cache. */
export async function loadCustomers(): Promise<Omit<CustomerRow, "password_hash">[]> {
  cache = await fetchCustomersFromAPI();
  return cache;
}

export function getCustomers(): Omit<CustomerRow, "password_hash">[] {
  return cache;
}

export function getCustomerShippingAddressById(customerId: number): string {
  return cache.find((entry) => entry.customer_id === customerId)?.shipping_address ?? "";
}

