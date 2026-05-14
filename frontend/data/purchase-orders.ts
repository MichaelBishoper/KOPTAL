import { customers } from "@/data/customers";
import { poLineItems } from "@/data/po-line-items";
import { tenantProducts } from "@/data/tenant-products";
import { tenants } from "@/data/tenants";
import { units } from "@/data/units";
import type { PoLineItemRow, PurchaseOrderRow } from "@/structure/db";

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
	items: POItem[];
};

export const purchaseOrderRows: PurchaseOrderRow[] = [
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

export function getPurchaseOrders(): PurchaseOrder[] {
	return purchaseOrderRows.map((purchaseOrder) => {
		const tenant = tenants.find((entry) => entry.tenant_id === purchaseOrder.tenant_id) ?? tenants[0];
		const customer = customers.find((entry) => entry.customer_id === purchaseOrder.customer_id) ?? customers[0];

		const items = poLineItems
			.filter((lineItem) => lineItem.po_id === purchaseOrder.po_id)
			.map((lineItem) => {
				const product = tenantProducts.find((entry) => entry.product_id === lineItem.product_id);
				const unit = units.find((entry) => entry.unit_id === product?.unit_id);

				return {
					...lineItem,
					id: `item-${lineItem.po_item_id}`,
					name: product?.name ?? `Product ${lineItem.product_id}`,
					price: lineItem.unit_price,
					image: product?.image ?? "/product-placeholder.jpg",
					details: `${tenant.name} • ${customer.company}`,
					unitLabel: unit?.unit_name ?? "Items",
				} as POItem;
			});

		return {
			...purchaseOrder,
			id: `po-${purchaseOrder.po_id}`,
			name: `PO ${purchaseOrder.po_id}`,
			items,
		};
	});
}
