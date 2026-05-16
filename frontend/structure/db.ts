export type AdminRow = {
  manager_id: number;
  name: string;
  email: string;
  phone: string;
  cooperative_id_number: string;
  categories: string[];
  password_hash: string;
  created_at: string;
};

export type CustomerRow = {
  customer_id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  business_id_number: string;
  corporate_tax_id: string;
  billing_address: string;
  shipping_address: string;
  password_hash: string;
  image_url?: string;
  created_at: string;
};

export type TenantRow = {
  tenant_id: number;
  name: string;
  email: string;
  phone: string;
  national_id_number: string;
  verified: boolean;
  location?: string;
  image?: string;
  password_hash: string;
  created_at: string;
};

export type UnitRow = {
  unit_id: number;
  unit_name: string;
  unit_symbol: string;
  unit_type: string;
};

export type TenantProductRow = {
  product_id: number;
  tenant_id: number;
  unit_id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  image?: string;
  description?: string;
};

export type PurchaseOrderRow = {
  po_id: number;
  po_number: string;
  customer_id: number;
  tenant_id: number;
  status: string;
  order_date: string;
  shipping_address: string;
  notes: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
};

export type PoLineItemRow = {
  po_item_id: number;
  po_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
};
