import type { TenantProductRow } from "@/structure/db";

export type ProductUnitType = "grams" | "pieces";

export type ProductMode = "add" | "edit";

export type ProductDraft = {
  id: string;
  name: string;
  category: string;
  price: string;
  unitType: ProductUnitType;
  tenantName: string;
  location: string;
  images: string[];
  description: string;
  availability: string;
};

export type TenantProductDraftRow = TenantProductRow & {
  tenant_name: string;
  unit_name: string;
  unit_symbol: string;
  description: string;
  location: string;
  images: string[];
};
