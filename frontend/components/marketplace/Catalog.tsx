"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCurrency, loadTenantProducts, loadTenants, loadUnits, toCatalogCard, filterProductsBySearch, type TenantProductCard } from "@/lib";

interface CatalogProps {
  products?: TenantProductCard[];
  columns?: 4 | 5;
  searchQuery?: string;
}

export default function Catalog({ products = [], columns = 4, searchQuery = "" }: CatalogProps) {
  const [allCards, setAllCards] = useState<TenantProductCard[]>([]);

  useEffect(() => {
    // Load tenants + units first so toCatalogCard can resolve names synchronously.
    Promise.all([loadTenants(), loadUnits(), loadTenantProducts()]).then(([, , rows]) => {
      setAllCards(rows.map(toCatalogCard));
    });
  }, []);

  // Use provided products, or search-filtered cards, or all loaded cards.
  let displayProducts: TenantProductCard[];
  if (products.length > 0) {
    displayProducts = products;
  } else if (searchQuery.trim()) {
    displayProducts = filterProductsBySearch(searchQuery).map(toCatalogCard);
  } else {
    displayProducts = allCards;
  }

  return (
    <div className="w-full py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 ${
            columns === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4"
          }`}
        >
        {displayProducts.map((product) => (
          <div
            key={product.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white h-full"
          >
            <Link href={`/customer/product/${product.id}`} className="block cursor-pointer">
              <div className="relative w-full aspect-square bg-gray-100">
                {product.image !== "/product-placeholder.jpg" && (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              <div className="p-4 pb-3">
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2">
                  {product.name}
                </h3>
                <p className="text-sm font-bold text-gray-900">Rp{formatCurrency(product.price)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Stock {product.quantity} {product.unitLabel}
                </p>
              </div>
            </Link>

            <div className="px-4 pb-4">
              <Link
                href={{
                  pathname: "/customer/tennant",
                  query: {
                    name: product.tenantName,
                    location: product.location,
                  },
                }}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline"
              >
                {product.tenantName}
              </Link>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                📍 {product.location}
              </p>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
