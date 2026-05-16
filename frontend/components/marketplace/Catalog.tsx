"use client";

import Image from "next/image";
import Link from "next/link";
import { formatCurrency, getUnitById, filterProductsBySearch, shouldUseNativeImage, safeImageSrc, type TenantProductCard } from "@/lib";
import { fetchTenantProductsFromAPI } from "@/fetch/tenant-products";
import { fetchTenantsFromAPI } from "@/fetch/tenants";
import { useEffect, useState } from "react";

interface CatalogProps {
  products?: TenantProductCard[];
  columns?: 4 | 5;
  searchQuery?: string;
}

export default function Catalog({ products = [], columns = 4, searchQuery = "" }: CatalogProps) {
  const [items, setItems] = useState<TenantProductCard[]>([]);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [rawDebug, setRawDebug] = useState<string | null>(null);

  // Safety: if rawDebug is set but items remain empty (race), parse rawDebug and populate items.
  useEffect(() => {
    if (rawDebug && items.length === 0) {
      try {
        const parsed = JSON.parse(rawDebug);
        const rows = Array.isArray(parsed.rows) ? parsed.rows : [];
        const tenants = Array.isArray(parsed.tenants) ? parsed.tenants : [];
        const cards: TenantProductCard[] = rows.map((row: any) => {
          const tenant = tenants.find((t: any) => t.tenant_id === row.tenant_id);
          const unit = getUnitById(row.unit_id);
          return {
            id: String(row.product_id),
            name: row.name,
            image: row.image ?? (tenant?.image ?? "/product-placeholder.jpg"),
            tenantName: tenant?.name ?? "Unknown Tenant",
            location: tenant?.location ?? "",
            price: row.price,
            quantity: Number(row.quantity),
            unitLabel: unit?.unit_name ?? "Items",
          };
        });
        setItems(cards);
      } catch (e) {
        // ignore
      }
    }
  }, [rawDebug, items.length]);

  // On mount, fetch products + tenant metadata directly and build cards.
  useEffect(() => {
    let mounted = true;

    async function fetchAndBuild() {
      setLoading(true);
      try {
        const [rows, tenants] = await Promise.all([
          fetchTenantProductsFromAPI(),
          fetchTenantsFromAPI(),
        ]);
        setRawDebug(JSON.stringify({ rows, tenants }, null, 2));

        const cards: TenantProductCard[] = rows.map((row) => {
          const tenant = tenants.find((t) => t.tenant_id === row.tenant_id);
          const unit = getUnitById(row.unit_id);
          return {
            id: String(row.product_id),
            name: row.name,
            image: row.image ?? row.image_url ?? (tenant?.image ?? "/product-placeholder.jpg"),
            tenantName: tenant?.name ?? "Unknown Tenant",
            location: tenant?.location ?? "",
            price: row.price,
            quantity: Number(row.quantity),
            unitLabel: unit?.unit_name ?? "Items",
          };
        });

        if (mounted) setItems(cards);
      } catch (err) {
        // capture the error for debug view
        // eslint-disable-next-line no-console
        console.error('[Catalog] fetch error', err);
        setRawDebug(String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchAndBuild();

    return () => { mounted = false; };
  }, []);

  // If `products` prop changes (explicit override), sync it into state.
  useEffect(() => {
    if (products.length > 0) {
      setItems(products);
    }
  }, [products]);

  // Apply search filter if query is provided
  let baseProducts = items;
  if (searchQuery.trim()) {
    const filteredRows = filterProductsBySearch(searchQuery);
    baseProducts = filteredRows.map(toCatalogCard);
  }

  const displayProducts = baseProducts.filter((product) => Number(product.quantity) > 0);

  // debug: log loading state and counts
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[Catalog] loading=', loading, 'items=', items.length, 'display=', displayProducts.length);
  }

  return (
    <div className="w-full py-8">
      { process.env.NODE_ENV !== 'production' && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4">
          <div className="text-xs text-gray-700">[Catalog debug] loading={String(loading)}, items={items.length}, display={displayProducts.length}</div>
          { rawDebug && (
            <pre className="text-xs text-gray-500 max-h-40 overflow-auto mt-2 bg-white p-2 border rounded">{rawDebug}</pre>
          ) }
        </div>
      ) }
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
                { /* Prefer the real image when available; fall back per-item to a neutral local SVG on load error. */ }
                { (() => {
                    const src = safeImageSrc(product.image || '/product-placeholder.jpg');
                    // If URL looks local/native, use plain img so browser handles it; otherwise use Next/Image
                    if (shouldUseNativeImage(src) || src.startsWith('/')) {
                      // eslint-disable-next-line @next/next/no-img-element
                      return <img src={src} alt={product.name} className="object-cover w-full h-full" />;
                    }

                    return (
                      <Image
                        src={src}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    );
                })() }
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
        { !loading && displayProducts.length === 0 && (
          <div className="col-span-1 lg:col-span-4 text-center text-gray-500 py-12">
            No products found.
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
