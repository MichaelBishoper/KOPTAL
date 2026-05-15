import ProductEditor from "@/components/tennant/product_editor";
import { getTenantProductForEditor } from "@/lib";
import type { ProductMode } from "@/structure/tenant-product";

type TennantAddProductProps = {
	searchParams?: Promise<{
		mode?: string;
		id?: string;
		productId?: string;
	}>;
};

export default async function TennantAddProduct({ searchParams }: TennantAddProductProps) {
	const params = (await searchParams) ?? {};
	const editingId = params.id ?? params.productId;
	const mode: ProductMode = params.mode === "edit" || !!editingId ? "edit" : "add";
	const initialProduct = await getTenantProductForEditor(editingId);

	return <ProductEditor mode={mode} initialProduct={initialProduct} />;
}
