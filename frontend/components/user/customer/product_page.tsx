"use client";

import ProductDetails from "@/components/customer/product_details";
import Gap from "@/components/system/Gap";
import { getTenantProductById, toProductDetails } from "@/lib";

export default function CustomerProductPage({ id }: { id: string }) {
  const row = getTenantProductById(id);

  if (!row) {
    return (
      <main className="w-full min-h-screen bg-white">
        <div className="p-8">
          <p className="text-lg text-gray-600">Product not found</p>
        </div>
      </main>
    );
  }
  const productForUI = toProductDetails(row);

  return (
    <main className="w-full bg-white">
      <Gap height="h-4" />
      <ProductDetails product={productForUI} />
    </main>
  );
}
