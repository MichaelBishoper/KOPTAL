import ProductEditor from "@/components/tennant/product_editor";
import { getTenantProductForEditor } from "@/lib";
import type { ProductMode } from "@/structure/tenant-product";

type TenantProductPageProps = {
  searchParams?: Promise<{
    mode?: string;
    id?: string;
  }>;
};

export default async function TenantProductPage({ searchParams }: TenantProductPageProps) {
  const params = (await searchParams) ?? {};
  const mode: ProductMode = params.mode === "edit" ? "edit" : "add";
  const initialProduct = await getTenantProductForEditor(params.id);

  return <ProductEditor mode={mode} initialProduct={initialProduct} />;
}
