import type { PoLineItemRow } from "@/structure/db";

export const poLineItems: PoLineItemRow[] = [
  {
    po_item_id: 1,
    po_id: 1,
    product_id: 1,
    quantity: 2,
    unit_price: 25000,
    subtotal: 50000,
  },
  {
    po_item_id: 2,
    po_id: 1,
    product_id: 2,
    quantity: 1,
    unit_price: 15000,
    subtotal: 15000,
  },
  {
    po_item_id: 3,
    po_id: 2,
    product_id: 3,
    quantity: 3,
    unit_price: 8000,
    subtotal: 24000,
  },
  {
    po_item_id: 4,
    po_id: 2,
    product_id: 4,
    quantity: 2,
    unit_price: 12000,
    subtotal: 24000,
  },
  {
    po_item_id: 5,
    po_id: 3,
    product_id: 5,
    quantity: 1,
    unit_price: 18000,
    subtotal: 18000,
  },
  {
    po_item_id: 6,
    po_id: 3,
    product_id: 4,
    quantity: 1,
    unit_price: 12000,
    subtotal: 12000,
  },
];
