import { customers } from "@/data/customers";
import type { CustomerRow } from "@/structure/db";

export function getCustomers(): CustomerRow[] {
  return customers;
}

export function getCustomerShippingAddressById(customerId: number): string {
  return customers.find((entry) => entry.customer_id === customerId)?.shipping_address ?? "";
}
