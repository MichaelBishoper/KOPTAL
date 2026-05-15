"use client";

import ProductDetails from "@/components/customer/product_details";
import Gap from "@/components/system/Gap";
import { useEffect, useState } from "react";
import { getTenantProductById, loadTenantProductById, toProductDetails } from "@/lib";

export default function CustomerProductPage({ id }: { id: string }) {
  const [row, setRow] = useState(() => getTenantProductById(id));

  useEffect(() => {
    if (row) return;
    void loadTenantProductById(id).then((loadedRow) => {
      if (loadedRow) setRow(loadedRow);
    });
  }, [id, row]);

  if (!row) {
    return (
      <main className="w-full min-h-screen bg-white">
        <div className="p-8">
          <p className="text-lg text-gray-600">Loading product...</p>
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
