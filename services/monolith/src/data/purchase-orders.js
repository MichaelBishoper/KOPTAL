// Mock purchase order data — replace with DB queries when PostgreSQL is connected.
const { tenants }       = require('./tenants');
const { customers }     = require('./customers');
const { tenantProducts }= require('./tenant-products');
const { units }         = require('./units');
const { poLineItems }   = require('./po-line-items');

const purchaseOrderRows = [
  {
    po_id: 1,
    po_number: "PO-2026-001",
    customer_id: 1,
    tenant_id: 1,
    status: "Delivered",
    order_date: "2026-05-12T00:00:00.000Z",
    shipping_address: "Jakarta",
    notes: "Deliver before noon",
    subtotal: 65000,
    tax_amount: 6500,
    total_amount: 71500,
  },
  {
    po_id: 2,
    po_number: "PO-2026-002",
    customer_id: 1,
    tenant_id: 3,
    status: "Pending",
    order_date: "2026-05-11T00:00:00.000Z",
    shipping_address: "Tangerang",
    notes: "Leave with security",
    subtotal: 48000,
    tax_amount: 4800,
    total_amount: 52800,
  },
  {
    po_id: 3,
    po_number: "PO-2026-003",
    customer_id: 1,
    tenant_id: 2,
    status: "Cancelled",
    order_date: "2026-05-10T00:00:00.000Z",
    shipping_address: "Depok",
    notes: "Cancelled by customer",
    subtotal: 30000,
    tax_amount: 3000,
    total_amount: 33000,
  },
];

/** Returns enriched purchase orders (joined with tenant, customer, items). */
function getPurchaseOrders() {
  return purchaseOrderRows.map((po) => {
    const tenant   = tenants.find((t) => t.tenant_id === po.tenant_id)     ?? tenants[0];
    const customer = customers.find((c) => c.customer_id === po.customer_id) ?? customers[0];

    const items = poLineItems
      .filter((li) => li.po_id === po.po_id)
      .map((li) => {
        const product = tenantProducts.find((p) => p.product_id === li.product_id);
        const unit    = units.find((u) => u.unit_id === product?.unit_id);
        return {
          ...li,
          id: `item-${li.po_item_id}`,
          name:      product?.name  ?? `Product ${li.product_id}`,
          price:     li.unit_price,
          image:     product?.image ?? "/product-placeholder.jpg",
          details:   `${tenant.name} • ${customer.company}`,
          unitLabel: unit?.unit_name ?? "Items",
        };
      });

    return {
      ...po,
      id:    `po-${po.po_id}`,
      name:  `PO ${po.po_id}`,
      items,
    };
  });
}

module.exports = { purchaseOrderRows, getPurchaseOrders };
